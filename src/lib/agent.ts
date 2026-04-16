import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getInstallationOctokit } from "@/lib/github";
import { createAgentTools } from "@/lib/agent-tools";

const MAX_ITERATIONS = 8;
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

  if (!company.githubInstallationId) {
    throw new Error("GitHub is not connected for this company");
  }

  const octokit = await getInstallationOctokit(company.githubInstallationId);

  const [owner, repo] = project.githubRepo.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid githubRepo format: ${project.githubRepo}`);
  }

  const tools = createAgentTools(octokit, owner, repo);

  // Get repo tree upfront to give the agent context
  let repoTree = "";
  try {
    const { data: treeData } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
      { owner, repo, tree_sha: project.defaultBranch, recursive: "1" }
    );
    repoTree = treeData.tree
      .filter((t: { type: string }) => t.type === "blob")
      .map((t: { path: string }) => t.path)
      .join("\n");
    log(`Loaded repo tree: ${treeData.tree.length} entries`);
  } catch (err) {
    log(`Failed to load repo tree: ${err instanceof Error ? err.message : "unknown"}`);
  }

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

  const systemPrompt = `You are a code agent that reads a GitHub repository and proposes file changes to address user feedback.

Repository: ${owner}/${repo} (default branch: ${project.defaultBranch})

IMPORTANT INSTRUCTIONS:
- You have a MAXIMUM of ${MAX_ITERATIONS} tool calls total. Be efficient.
- Do NOT waste iterations listing directories. The full file tree is provided below.
- Read only the files you need (2-5 files typically), then propose changes.
- You MUST call propose_changes before your iterations run out.
- If the feedback is unclear, make your best interpretation and propose something reasonable.
- You may change at most ${MAX_FILES_CHANGED} files.
- Keep changes minimal and focused on the feedback.

FILE TREE:
${repoTree || "(failed to load - use read_file with paths you can infer)"}

USER FEEDBACK:
${feedback.content}${feedback.sourceUrl ? `\n\nSubmitted from: ${feedback.sourceUrl}` : ""}${feedback.submitterEmail ? `\nSubmitter: ${feedback.submitterEmail}` : ""}`;

  const anthropic = new Anthropic();
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        "Read the most relevant files based on the file tree and user feedback, then propose changes. Be efficient — you have limited iterations.",
    },
  ];

  let proposedChanges: FileChange[] | null = null;
  let prSummary = "";

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    log(`Iteration ${i + 1}/${MAX_ITERATIONS}`);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 65536,
      system: systemPrompt,
      tools: anthropicTools,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      log("Agent finished without proposing changes");
      break;
    }

    if (response.stop_reason === "max_tokens") {
      log("Response hit max_tokens - asking agent to continue with smaller changes");
      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: "Your response was cut off due to length. Please propose changes for fewer files, or split into smaller changes.",
      });
      continue;
    }

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

    // Nudge the agent if running low on iterations
    if (i === MAX_ITERATIONS - 3 && proposedChanges === null) {
      messages.push({
        role: "user",
        content: "You are running low on iterations. Please propose your changes NOW using propose_changes, even if they are imperfect.",
      });
    }
  }

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

  const branchName = `feedbackiq/feedback-${feedbackId.slice(0, 8)}`;

  const { data: refData } = await octokit.request(
    "GET /repos/{owner}/{repo}/git/ref/{ref}",
    { owner, repo, ref: `heads/${project.defaultBranch}` }
  );
  const baseSha = refData.object.sha;

  await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });
  log(`Created branch: ${branchName}`);

  for (const change of proposedChanges) {
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
      // File doesn't exist yet
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

  const prTitle = `[FeedbackIQ] ${feedback.content.slice(0, 72)}${feedback.content.length > 72 ? "..." : ""}`;
  const prBody = `## Feedback

${feedback.content}

${feedback.sourceUrl ? `**Source:** ${feedback.sourceUrl}` : ""}
${feedback.submitterEmail ? `**Submitter:** ${feedback.submitterEmail}` : ""}

## Changes

${prSummary}

---
*This PR was automatically generated by [FeedbackIQ](https://feedbackiq.app).*`;

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

  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { status: "pr_created" },
  });

  log("Agent completed successfully");
}
