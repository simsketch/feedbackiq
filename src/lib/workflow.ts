import type { Octokit } from "@octokit/core";
import sodium from "libsodium-wrappers";

const WORKFLOW_PATH = ".github/workflows/feedbackiq-agent.yml";
const SECRET_NAME = "FEEDBACKIQ_ANTHROPIC_KEY";

// ---------------------------------------------------------------------------
// Workflow YAML template
// ---------------------------------------------------------------------------

const AGENT_SCRIPT = `
const Anthropic = require("@anthropic-ai/sdk").default;
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const MAX_ITERATIONS = 12;
const MAX_FILES_CHANGED = 10;

const {
  ANTHROPIC_API_KEY,
  FEEDBACK_ID,
  FEEDBACK_CONTENT,
  SOURCE_URL,
  DEFAULT_BRANCH,
  CALLBACK_URL,
  CALLBACK_SECRET,
  GITHUB_REPOSITORY,
} = process.env;

async function run() {
  const agentLog = [];
  const log = (msg) => { console.log(msg); agentLog.push(msg); };

  async function callback(payload) {
    try {
      await fetch(CALLBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-FeedbackIQ-Secret": CALLBACK_SECRET,
        },
        body: JSON.stringify({ feedback_id: FEEDBACK_ID, ...payload }),
      });
    } catch (e) {
      log("Callback failed: " + e.message);
    }
  }

  try {
    // Build file tree (excluding .git, node_modules, common build dirs)
    const tree = execSync(
      'find . -type f ' +
      '-not -path "./.git/*" ' +
      '-not -path "./node_modules/*" ' +
      '-not -path "./.next/*" ' +
      '-not -path "./dist/*" ' +
      '-not -path "./build/*" ' +
      '| head -2000 | sort',
      { encoding: "utf-8" }
    ).trim();

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const systemPrompt = [
      "You are a code agent that reads a repository and proposes file changes to address user feedback.",
      "Repository: " + GITHUB_REPOSITORY + " (default branch: " + DEFAULT_BRANCH + ")",
      "",
      "IMPORTANT INSTRUCTIONS:",
      "- You have a MAXIMUM of " + MAX_ITERATIONS + " tool calls total. Be efficient.",
      "- Do NOT waste iterations listing directories. The full file tree is provided below.",
      "- Read only the files you need (2-5 files typically), then propose changes.",
      "- You MUST call propose_changes before your iterations run out.",
      "- If the feedback is unclear, make your best interpretation and propose something reasonable.",
      "- You may change at most " + MAX_FILES_CHANGED + " files.",
      "- Keep changes minimal and focused on the feedback.",
      "",
      "FILE TREE:",
      tree,
      "",
      "USER FEEDBACK:",
      FEEDBACK_CONTENT,
      SOURCE_URL ? "\\nSubmitted from: " + SOURCE_URL : "",
    ].join("\\n");

    const tools = [
      {
        name: "read_file",
        description: "Read a file from the local repository. Path is relative to repo root.",
        input_schema: {
          type: "object",
          properties: { path: { type: "string", description: "File path relative to repo root" } },
          required: ["path"],
        },
      },
      {
        name: "propose_changes",
        description: "Propose file changes. Call this when you know what to change.",
        input_schema: {
          type: "object",
          properties: {
            changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string", description: "File path relative to repo root" },
                  content: { type: "string", description: "Full new file content" },
                  summary: { type: "string", description: "Short summary of the change" },
                },
                required: ["path", "content", "summary"],
              },
            },
            pr_title: { type: "string", description: "PR title" },
            pr_summary: { type: "string", description: "Overall summary for PR body" },
          },
          required: ["changes", "pr_title", "pr_summary"],
        },
      },
    ];

    const messages = [
      {
        role: "user",
        content: "Read the most relevant files based on the file tree and user feedback, then propose changes. Be efficient.",
      },
    ];

    let proposedChanges = null;
    let prTitle = "";
    let prSummary = "";

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      log("Iteration " + (i + 1) + "/" + MAX_ITERATIONS);

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16384,
        system: systemPrompt,
        tools,
        messages,
      });

      if (response.stop_reason === "end_turn") {
        log("Agent finished without proposing changes");
        break;
      }

      messages.push({ role: "assistant", content: response.content });
      const toolResults = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        log("Tool call: " + block.name);

        try {
          let result;
          if (block.name === "read_file") {
            const filePath = path.resolve(block.input.path);
            result = fs.readFileSync(filePath, "utf-8");
            if (result.length > 50000) result = result.slice(0, 50000) + "\\n... (truncated)";
          } else if (block.name === "propose_changes") {
            if (block.input.changes.length > MAX_FILES_CHANGED) {
              result = "Too many files (" + block.input.changes.length + "). Max is " + MAX_FILES_CHANGED + ".";
            } else {
              proposedChanges = block.input.changes;
              prTitle = block.input.pr_title || "[FeedbackIQ] Address feedback";
              prSummary = block.input.pr_summary || "";
              result = "Accepted " + block.input.changes.length + " file change(s).";
            }
          } else {
            result = "Unknown tool: " + block.name;
          }
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
        } catch (e) {
          log("Tool error: " + e.message);
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: "Error: " + e.message, is_error: true });
        }
      }

      messages.push({ role: "user", content: toolResults });
      if (proposedChanges) break;

      if (i === MAX_ITERATIONS - 3 && !proposedChanges) {
        messages.push({
          role: "user",
          content: "Running low on iterations. Please propose changes NOW using propose_changes.",
        });
      }
    }

    if (!proposedChanges || proposedChanges.length === 0) {
      log("No changes proposed - closing feedback");
      await callback({ status: "closed", agent_log: agentLog.join("\\n") });
      return;
    }

    // Create branch, write files, commit, push
    const branchName = "feedbackiq/feedback-" + FEEDBACK_ID.slice(0, 8);
    execSync("git checkout -b " + branchName);

    for (const change of proposedChanges) {
      const dir = path.dirname(change.path);
      if (dir !== ".") fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(change.path, change.content);
      log("Wrote: " + change.path);
    }

    execSync('git add -A');
    execSync('git commit -m "' + prTitle.replace(/"/g, '\\\\"') + '"');
    execSync("git push origin " + branchName);
    log("Pushed branch: " + branchName);

    // Open PR via gh CLI
    const prBody = [
      "## Feedback\\n",
      FEEDBACK_CONTENT,
      SOURCE_URL ? "\\n**Source:** " + SOURCE_URL : "",
      "\\n## Changes\\n",
      prSummary,
      "\\n---",
      "*This PR was automatically generated by [FeedbackIQ](https://feedbackiq.app).*",
    ].join("\\n");

    const prResult = execSync(
      'gh pr create --title "' + prTitle.replace(/"/g, '\\\\"') + '" --body "' + prBody.replace(/"/g, '\\\\"') + '" --base ' + DEFAULT_BRANCH,
      { encoding: "utf-8" }
    ).trim();
    log("Created PR: " + prResult);

    // Extract PR number and URL
    const prUrl = prResult;
    const prNumberMatch = prResult.match(/\\/pull\\/(\\d+)/);
    const prNumber = prNumberMatch ? parseInt(prNumberMatch[1]) : null;

    await callback({
      status: "pr_created",
      pr_url: prUrl,
      pr_number: prNumber,
      branch_name: branchName,
      agent_log: agentLog.join("\\n"),
    });

  } catch (err) {
    log("Fatal error: " + err.message);
    await callback({
      status: "closed",
      error: err.message,
      agent_log: agentLog.join("\\n"),
    });
    process.exit(1);
  }
}

run();
`.trim();

function buildWorkflowYaml(): string {
  return `name: FeedbackIQ Agent
on:
  workflow_dispatch:
    inputs:
      feedback_id:
        description: "Feedback ID"
        required: true
      feedback_content:
        description: "Feedback content"
        required: true
      source_url:
        description: "Source URL where feedback was submitted"
        required: false
      default_branch:
        description: "Default branch of the repo"
        required: true
      callback_url:
        description: "Callback URL for results"
        required: true
      callback_secret:
        description: "Secret for callback authentication"
        required: true

jobs:
  generate-pr:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Anthropic SDK
        run: npm install @anthropic-ai/sdk

      - name: Run FeedbackIQ Agent
        env:
          ANTHROPIC_API_KEY: \${{ secrets.FEEDBACKIQ_ANTHROPIC_KEY }}
          FEEDBACK_ID: \${{ inputs.feedback_id }}
          FEEDBACK_CONTENT: \${{ inputs.feedback_content }}
          SOURCE_URL: \${{ inputs.source_url }}
          DEFAULT_BRANCH: \${{ inputs.default_branch }}
          CALLBACK_URL: \${{ inputs.callback_url }}
          CALLBACK_SECRET: \${{ inputs.callback_secret }}
          GH_TOKEN: \${{ github.token }}
        run: node -e '${AGENT_SCRIPT.replace(/'/g, "'\\''")}'
`;
}

// ---------------------------------------------------------------------------
// ensureWorkflowInstalled
// ---------------------------------------------------------------------------

export async function ensureWorkflowInstalled(
  octokit: Octokit,
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<void> {
  // Check if the workflow file already exists
  try {
    await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path: WORKFLOW_PATH,
      ref: defaultBranch,
    });
    // File exists, nothing to do
    return;
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status !== 404) throw err;
  }

  // Create the workflow file
  const content = buildWorkflowYaml();
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: WORKFLOW_PATH,
    message: "Add FeedbackIQ agent workflow",
    content: Buffer.from(content).toString("base64"),
    branch: defaultBranch,
  });
}

// ---------------------------------------------------------------------------
// ensureSecretSet
// ---------------------------------------------------------------------------

export async function ensureSecretSet(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<void> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in the environment");
  }

  await sodium.ready;

  // Get the repo's public key for encrypting secrets
  const { data: publicKeyData } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/secrets/public-key",
    { owner, repo }
  );

  // Encrypt the secret
  const binKey = sodium.from_base64(
    publicKeyData.key,
    sodium.base64_variants.ORIGINAL
  );
  const binSecret = sodium.from_string(anthropicKey);
  const encrypted = sodium.crypto_box_seal(binSecret, binKey);
  const encryptedBase64 = sodium.to_base64(
    encrypted,
    sodium.base64_variants.ORIGINAL
  );

  // Set the secret
  await octokit.request(
    "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
    {
      owner,
      repo,
      secret_name: SECRET_NAME,
      encrypted_value: encryptedBase64,
      key_id: publicKeyData.key_id,
    }
  );
}

// ---------------------------------------------------------------------------
// triggerWorkflow
// ---------------------------------------------------------------------------

export async function triggerWorkflow(
  octokit: Octokit,
  owner: string,
  repo: string,
  feedbackId: string,
  feedbackContent: string,
  sourceUrl: string | null,
  defaultBranch: string,
  callbackUrl: string
): Promise<void> {
  const callbackSecret = process.env.GITHUB_APP_WEBHOOK_SECRET;
  if (!callbackSecret) {
    throw new Error("GITHUB_APP_WEBHOOK_SECRET is not set");
  }

  await octokit.request(
    "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
    {
      owner,
      repo,
      workflow_id: "feedbackiq-agent.yml",
      ref: defaultBranch,
      inputs: {
        feedback_id: feedbackId,
        feedback_content: feedbackContent,
        source_url: sourceUrl || "",
        default_branch: defaultBranch,
        callback_url: callbackUrl,
        callback_secret: callbackSecret,
      },
    }
  );
}
