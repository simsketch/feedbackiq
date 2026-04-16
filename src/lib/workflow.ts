import type { Octokit } from "@octokit/core";
import sodium from "libsodium-wrappers";

const WORKFLOW_PATH = ".github/workflows/feedbackiq.yml";
const SECRET_NAME = "FEEDBACKIQ_ANTHROPIC_KEY";

function buildWorkflowYaml(): string {
  return `name: FeedbackIQ Agent
on:
  workflow_dispatch:
    inputs:
      feedback_id:
        description: Feedback ID
        required: true
      feedback_content:
        description: Feedback content
        required: true
      source_url:
        description: Source URL
        required: false
        default: ""
      default_branch:
        description: Default branch
        required: true
      callback_url:
        description: Callback URL
        required: true
      callback_secret:
        description: Callback secret
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

      - name: Write agent script
        run: |
          cat > /tmp/feedbackiq-agent.mjs << 'AGENT_EOF'
          import Anthropic from "@anthropic-ai/sdk";
          import fs from "fs";
          import path from "path";
          import { execSync } from "child_process";

          const MAX_ITERATIONS = 12;
          const MAX_FILES = 10;
          const { ANTHROPIC_API_KEY, FEEDBACK_ID, FEEDBACK_CONTENT, SOURCE_URL, DEFAULT_BRANCH, CALLBACK_URL, CALLBACK_SECRET, GITHUB_REPOSITORY } = process.env;

          const agentLog = [];
          const log = (m) => { console.log(m); agentLog.push(m); };

          async function cb(payload) {
            try {
              await fetch(CALLBACK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-FeedbackIQ-Secret": CALLBACK_SECRET },
                body: JSON.stringify({ feedback_id: FEEDBACK_ID, ...payload }),
              });
            } catch (e) { log("Callback failed: " + e.message); }
          }

          try {
            const tree = execSync('find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./dist/*" -not -path "./build/*" | head -2000 | sort', { encoding: "utf-8" }).trim();

            const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY, timeout: 600000 });

            const system = "You are a code agent that reads a repository and proposes file changes to address user feedback.\n" +
              "Repository: " + GITHUB_REPOSITORY + " (branch: " + DEFAULT_BRANCH + ")\n\n" +
              "INSTRUCTIONS:\n- Max " + MAX_ITERATIONS + " tool calls. Be efficient.\n- File tree is below. Do NOT list directories.\n" +
              "- Read 2-5 key files, then call propose_changes.\n- You MUST call propose_changes before iterations run out.\n" +
              "- Max " + MAX_FILES + " files changed. Keep changes minimal.\n\nFILE TREE:\n" + tree +
              "\n\nUSER FEEDBACK:\n" + FEEDBACK_CONTENT + (SOURCE_URL ? "\nFrom: " + SOURCE_URL : "");

            const tools = [
              { name: "read_file", description: "Read a file. Path relative to repo root.",
                input_schema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
              { name: "propose_changes", description: "Propose file changes.",
                input_schema: { type: "object", properties: {
                  changes: { type: "array", items: { type: "object", properties: {
                    path: { type: "string" }, content: { type: "string" }, summary: { type: "string" }
                  }, required: ["path", "content", "summary"] } },
                  pr_title: { type: "string" }, pr_summary: { type: "string" }
                }, required: ["changes", "pr_title", "pr_summary"] } },
            ];

            const messages = [{ role: "user", content: "Read relevant files and propose changes. Be efficient." }];
            let changes = null, prTitle = "", prSummary = "";

            for (let i = 0; i < MAX_ITERATIONS; i++) {
              log("Iteration " + (i+1) + "/" + MAX_ITERATIONS);
              const res = await anthropic.messages.create({ model: "claude-sonnet-4-6", max_tokens: 65536, system, tools, messages });

              if (res.stop_reason === "end_turn") { log("Agent done"); break; }
              messages.push({ role: "assistant", content: res.content });
              const results = [];

              for (const b of res.content) {
                if (b.type !== "tool_use") continue;
                log("Tool: " + b.name);
                try {
                  let r;
                  if (b.name === "read_file") {
                    r = fs.readFileSync(path.resolve(b.input.path), "utf-8");
                    if (r.length > 50000) r = r.slice(0, 50000) + "\n...(truncated)";
                  } else if (b.name === "propose_changes") {
                    if (b.input.changes.length > MAX_FILES) { r = "Too many files"; }
                    else { changes = b.input.changes; prTitle = b.input.pr_title || "[FeedbackIQ] Address feedback"; prSummary = b.input.pr_summary || ""; r = "Accepted " + changes.length + " changes"; }
                  } else { r = "Unknown tool"; }
                  results.push({ type: "tool_result", tool_use_id: b.id, content: r });
                } catch (e) {
                  log("Error: " + e.message);
                  results.push({ type: "tool_result", tool_use_id: b.id, content: "Error: " + e.message, is_error: true });
                }
              }
              messages.push({ role: "user", content: results });
              if (changes) break;
              if (i === MAX_ITERATIONS - 3) messages.push({ role: "user", content: "Running low. Propose changes NOW." });
            }

            if (!changes || changes.length === 0) {
              log("No changes proposed");
              await cb({ status: "closed", agent_log: agentLog.join("\n") });
              process.exit(0);
            }

            const branch = "feedbackiq/feedback-" + FEEDBACK_ID.slice(0, 8);
            execSync("git checkout -b " + branch);
            for (const c of changes) {
              const dir = path.dirname(c.path);
              if (dir !== ".") fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(c.path, c.content);
              log("Wrote: " + c.path);
            }
            execSync("git add -A");
            execSync("git -c user.name=FeedbackIQ -c user.email=bot@feedbackiq.app commit -m " + JSON.stringify(prTitle));
            execSync("git push origin " + branch);
            log("Pushed: " + branch);

            const body = "## Feedback\\n\\n" + FEEDBACK_CONTENT + (SOURCE_URL ? "\\n\\n**Source:** " + SOURCE_URL : "") + "\\n\\n## Changes\\n\\n" + prSummary + "\\n\\n---\\n*Auto-generated by [FeedbackIQ](https://feedbackiq.app)*";
            const prOut = execSync("gh pr create --title " + JSON.stringify(prTitle) + " --body " + JSON.stringify(body) + " --base " + DEFAULT_BRANCH, { encoding: "utf-8" }).trim();
            log("PR: " + prOut);

            const num = prOut.match(/\\/pull\\/(\\d+)/);
            await cb({ status: "pr_created", pr_url: prOut, pr_number: num ? parseInt(num[1]) : null, branch_name: branch, agent_log: agentLog.join("\n") });
          } catch (err) {
            log("Fatal: " + err.message);
            await cb({ status: "closed", error: err.message, agent_log: agentLog.join("\n") });
            process.exit(1);
          }
          AGENT_EOF

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
        run: node /tmp/feedbackiq-agent.mjs
`;
}

export async function ensureWorkflowInstalled(
  octokit: Octokit,
  owner: string,
  repo: string,
  defaultBranch: string
): Promise<boolean> {
  try {
    await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path: WORKFLOW_PATH, ref: defaultBranch }
    );
    return false; // already exists
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status !== 404) throw err;
  }

  const content = buildWorkflowYaml();
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: WORKFLOW_PATH,
    message: "Add FeedbackIQ agent workflow",
    content: Buffer.from(content).toString("base64"),
    branch: defaultBranch,
  });
  return true; // newly created
}

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

  const { data: publicKeyData } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/secrets/public-key",
    { owner, repo }
  );

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function triggerWorkflow(
  octokit: Octokit,
  owner: string,
  repo: string,
  feedbackId: string,
  feedbackContent: string,
  sourceUrl: string | null,
  defaultBranch: string,
  callbackUrl: string,
  justCreated: boolean = false
): Promise<void> {
  const callbackSecret = process.env.GITHUB_APP_WEBHOOK_SECRET;
  if (!callbackSecret) {
    throw new Error("GITHUB_APP_WEBHOOK_SECRET is not set");
  }

  const maxAttempts = justCreated ? 5 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (justCreated && attempt > 1) {
      await sleep(5000);
    }

    try {
      await octokit.request(
        "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
        {
          owner,
          repo,
          workflow_id: "feedbackiq.yml",
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
      return;
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 422 && attempt < maxAttempts) {
        continue;
      }
      throw err;
    }
  }
}
