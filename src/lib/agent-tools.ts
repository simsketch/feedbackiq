import type { Octokit } from "@octokit/core";

export interface AgentTools {
  readFile(path: string): Promise<string>;
  listDirectory(path: string): Promise<string[]>;
  searchCode(query: string): Promise<{ path: string; snippet: string }[]>;
}

export function createAgentTools(
  octokit: Octokit,
  owner: string,
  repo: string
): AgentTools {
  return {
    async readFile(path: string): Promise<string> {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        { owner, repo, path }
      );

      if (Array.isArray(data) || data.type !== "file" || !("content" in data)) {
        throw new Error(`Path "${path}" is not a file`);
      }

      return Buffer.from(data.content, "base64").toString("utf-8");
    },

    async listDirectory(path: string): Promise<string[]> {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        { owner, repo, path: path || "" }
      );

      if (!Array.isArray(data)) {
        throw new Error(`Path "${path}" is not a directory`);
      }

      return data.map(
        (item: { name: string; type: string }) =>
          `${item.name}${item.type === "dir" ? "/" : ""}`
      );
    },

    async searchCode(
      query: string
    ): Promise<{ path: string; snippet: string }[]> {
      const { data } = await octokit.request("GET /search/code", {
        q: `${query} repo:${owner}/${repo}`,
        per_page: 10,
      });

      return data.items.map(
        (item) => ({
          path: item.path,
          snippet:
            item.text_matches
              ?.map((m) => m.fragment ?? "")
              .filter(Boolean)
              .join("\n") || "",
        })
      );
    },
  };
}
