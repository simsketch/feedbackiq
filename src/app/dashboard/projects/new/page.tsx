"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, githubRepo, defaultBranch }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const project = await res.json();
      router.push(`/dashboard/projects/${project.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">New Project</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-400"
          >
            Project name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 sm:text-sm"
            placeholder="My Awesome App"
          />
        </div>

        <div>
          <label
            htmlFor="githubRepo"
            className="block text-sm font-medium text-zinc-400"
          >
            GitHub repository (owner/repo)
          </label>
          <input
            id="githubRepo"
            type="text"
            required
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="mt-1 block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 sm:text-sm"
            placeholder="owner/repo"
          />
        </div>

        <div>
          <label
            htmlFor="defaultBranch"
            className="block text-sm font-medium text-zinc-400"
          >
            Default branch
          </label>
          <input
            id="defaultBranch"
            type="text"
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
            className="mt-1 block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-500 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
