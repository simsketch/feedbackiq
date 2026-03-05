import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";
import { createAgentTools } from "@/lib/agent-tools";

const MAX_ITERATIONS = 20;
const MAX_FILES_CHANGED = 10;

interface FileChange {
  path: string;
  content: string;
  summary: string;
}

export async function runAgent(feedbackId: string): Promise<void> {
  const agentLog: string[] = [];
  const log = (msg: string) => {
    console.log(`[agent:${feedbackId.slice(0, 8)}] ${msg}`);
    agentLog.push(msg);
  };

  // 1. Fetch feedback with project and company
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: {
      project: {
        include: { company: true },
      },
    },
  });

  if (!feedback) throw new Error("Feedback not found");

  const { project } = feedback;
  const { company } = project;

  // 2. Verify GitHub is connected
  if (!company.githubInstallationId) {
    throw new Error("GitHub is not connected for this company");
  }

  const octokit = await getInstallationOctokit(company.githubInstallationId);

  // 3. Split githubRepo into owner/repo
  const [owner, repo] = project.githubRepo.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid githubRepo format: ${project.githubRepo}`);
  }

  // 4. Create agent tools
  const tools = createAgentTools(octokit, owner, repo);

  // 5. Define Anthropic tools
  const anthropicTools: Anthropic.Tool[] = [
    {
      name: "read_file",
      description:
        "Read the contents of a file from the repository. Provide the file path relative to the repo root.",
      input_schema: {
        type: "object" as const,
        properties: {
          path: {
            type: "string",
            description: "File path relative to repo root",
          },
        },
        required: ["path"],
      },
    },
    {
      name: "list_directory",
      description:
        "List the contents of a directory in the repository. Returns file and directory names (directories end with /).",
      input_schema: {
        type: "object" as const,
        properties: {
          path: {
            type: "string",
            description:
              'Directory path relative to repo root. Use "" for the root.',
          },
        },
        required: ["path"],
      },
    },
    {
      name: "search_code",
      description:
        "Search for code in the repository. Returns matching file paths and code snippets.",
      input_schema: {
        type: "object" as const,
        properties: {
          query: {
            type: "string",
            description: "Search query string",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "propose_changes",
      description:
        "Propose file changes to address the feedback. Call this when you have determined what changes to make. Each change includes the file path, full new file content, and a short summary.",
      input_schema: {
        type: "object" as const,
        properties: {
          changes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "File path relative to repo root",
                },
                content: {
                  type: "string",
                  description: "Full new file content",
                },
                summary: {
                  type: "string",
                  description: "Short summary of the change",
                },
              },
              required: ["path", "content", "summary"],
            },
            description: "Array of file changes to make",
          },
          pr_summary: {
            type: "string",
            description: "Overall summary of all changes for the PR body",
          },
        },
        required: ["changes", "pr_summary"],
      },
    },
  ];

  // 6. System prompt
  const systemPrompt = `You are a code agent that reads a GitHub repository and proposes file changes to address user feedback.

Repository: ${owner}/${repo} (default branch: ${project.defaultBranch})

Your task is to analyze the following user feedback and propose concrete code changes to address it.
Explore the repository structure, read relevant files, and then propose specific changes.

Rules:
- You may change at most ${MAX_FILES_CHANGED} files
- Only propose changes you are confident about
- If you cannot determine what to change, call propose_changes with an empty changes array
- Keep changes minimal and focused on the feedback
- Always read relevant files before proposing changes

User feedback:
${feedback.content}${feedback.sourceUrl ? `\n\nSubmitted from: ${feedback.sourceUrl}` : ""}${feedback.submitterEmail ? `\nSubmitter: ${feedback.submitterEmail}` : ""}`;

  // 7. Agent loop
  const anthropic = new Anthropic();
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        "Please explore the repository and propose changes to address the feedback described in the system prompt. Start by listing the root directory.",
    },
  ];

  let proposedChanges: FileChange[] | null = null;
  let prSummary = "";

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    log(`Iteration ${i + 1}`);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      tools: anthropicTools,
      messages,
    });

    // Check if the model wants to use tools
    if (response.stop_reason === "end_turn") {
      log("Agent finished without proposing changes");
      break;
    }

    // Process tool calls
    const assistantContent = response.content;
    messages.push({ role: "assistant", content: assistantContent });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of assistantContent) {
      if (block.type !== "tool_use") continue;

      log(`Tool call: ${block.name}`);

      try {
        let result: string;

        switch (block.name) {
          case "read_file": {
            const input = block.input as { path: string };
            const content = await tools.readFile(input.path);
            result = content;
            break;
          }
          case "list_directory": {
            const input = block.input as { path: string };
            const entries = await tools.listDirectory(input.path);
            result = entries.join("\n");
            break;
          }
          case "search_code": {
            const input = block.input as { query: string };
            const results = await tools.searchCode(input.query);
            result = results
              .map((r) => `${r.path}:\n${r.snippet}`)
              .join("\n---\n");
            if (!result) result = "No results found.";
            break;
          }
          case "propose_changes": {
            const input = block.input as {
              changes: FileChange[];
              pr_summary: string;
            };

            if (input.changes.length > MAX_FILES_CHANGED) {
              result = `Too many files changed (${input.changes.length}). Maximum is ${MAX_FILES_CHANGED}.`;
            } else {
              proposedChanges = input.changes;
              prSummary = input.pr_summary;
              result = `Accepted ${input.changes.length} file change(s).`;
              log(result);
            }
            break;
          }
          default:
            result = `Unknown tool: ${block.name}`;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";
        log(`Tool error (${block.name}): ${errorMsg}`);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Error: ${errorMsg}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });

    if (proposedChanges !== null) break;
  }

  // 8. No changes proposed
  if (!proposedChanges || proposedChanges.length === 0) {
    log("No changes proposed - closing feedback");
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: "closed" },
    });
    await prisma.pullRequest.create({
      data: {
        feedbackId,
        branchName: "",
        status: "closed",
        agentLog: agentLog.join("\n"),
      },
    });
    return;
  }

  // 9. Create branch, commit files, open PR
  const branchName = `feedbackiq/feedback-${feedbackId.slice(0, 8)}`;

  // Get base SHA from default branch
  const { data: refData } = await octokit.request(
    "GET /repos/{owner}/{repo}/git/ref/{ref}",
    { owner, repo, ref: `heads/${project.defaultBranch}` }
  );
  const baseSha = refData.object.sha;

  // Create branch
  await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });
  log(`Created branch: ${branchName}`);

  // Commit each file change via Contents API
  for (const change of proposedChanges) {
    // Try to get the existing file's SHA for updates
    let fileSha: string | undefined;
    try {
      const { data: existingFile } = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        { owner, repo, path: change.path, ref: branchName }
      );
      if (!Array.isArray(existingFile) && "sha" in existingFile) {
        fileSha = existingFile.sha;
      }
    } catch {
      // File doesn't exist yet - that's fine for new files
    }

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: change.path,
      message: change.summary,
      content: Buffer.from(change.content).toString("base64"),
      branch: branchName,
      ...(fileSha ? { sha: fileSha } : {}),
    });
    log(`Committed: ${change.path}`);
  }

  // Create PR
  const prTitle = `[FeedbackIQ] ${feedback.content.slice(0, 72)}${feedback.content.length > 72 ? "..." : ""}`;
  const prBody = `## Feedback

${feedback.content}

${feedback.sourceUrl ? `**Source:** ${feedback.sourceUrl}` : ""}
${feedback.submitterEmail ? `**Submitter:** ${feedback.submitterEmail}` : ""}

## Changes

${prSummary}

---
*This PR was automatically generated by [FeedbackIQ](https://feedbackiq.dev).*`;

  const { data: pr } = await octokit.request(
    "POST /repos/{owner}/{repo}/pulls",
    {
      owner,
      repo,
      title: prTitle,
      body: prBody,
      head: branchName,
      base: project.defaultBranch,
    }
  );
  log(`Created PR #${pr.number}: ${pr.html_url}`);

  // Create PullRequest record
  await prisma.pullRequest.create({
    data: {
      feedbackId,
      githubPrUrl: pr.html_url,
      githubPrNumber: pr.number,
      branchName,
      status: "open",
      agentLog: agentLog.join("\n"),
    },
  });

  // Update feedback status
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { status: "pr_created" },
  });

  log("Agent completed successfully");
}
