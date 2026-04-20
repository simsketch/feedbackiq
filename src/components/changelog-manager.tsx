"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Entry = {
  id: string;
  title: string;
  body: string;
  status: string;
  prUrl: string | null;
  publishedAt: string;
  pullRequestId: string | null;
};

interface Props {
  initialEntries: Entry[];
}

export default function ChangelogManager({ initialEntries }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditBody(entry.body);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  }

  async function saveEdit(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/changelog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, body: editBody }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      const updated = await res.json();
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusyId(null);
    }
  }

  async function publish(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/changelog/${id}/publish`, {
        method: "POST",
      });
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      const updated = await res.json();
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusyId(null);
    }
  }

  async function unpublish(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/changelog/${id}/publish`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      const updated = await res.json();
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusyId(null);
    }
  }

  async function regenerate(entry: Entry) {
    if (!entry.pullRequestId) return;
    if (!confirm("Regenerate title and body from the PR feedback?")) return;
    setBusyId(entry.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/pull-requests/${entry.pullRequestId}/generate-changelog`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force: true }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      const updated = await res.json();
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, ...updated } : e))
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this changelog entry? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/changelog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setBusyId(null);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="glow-card rounded-xl bg-[#18181b] p-12 text-center">
        <p className="text-zinc-400">
          No changelog entries yet. Merge a feedback PR to generate one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      {entries.map((entry) => {
        const isEditing = editingId === entry.id;
        const isBusy = busyId === entry.id;
        const isPublished = entry.status === "published";
        return (
          <div key={entry.id} className="glow-card rounded-xl bg-[#18181b] p-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${
                    isPublished
                      ? "bg-green-500/10 text-green-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {entry.status}
                </span>
                <time className="text-zinc-500">
                  {new Date(entry.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                {entry.prUrl && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <a
                      href={entry.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      View PR
                    </a>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="Title"
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={4}
                  maxLength={800}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-500 focus:outline-none"
                  placeholder="Body"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveEdit(entry.id)}
                    disabled={isBusy}
                    className="btn-snake"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isBusy}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {entry.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {entry.body}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(entry)}
                    disabled={isBusy}
                    className="btn-ghost"
                  >
                    Edit
                  </button>
                  {isPublished ? (
                    <button
                      type="button"
                      onClick={() => unpublish(entry.id)}
                      disabled={isBusy}
                      className="btn-ghost"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => publish(entry.id)}
                      disabled={isBusy}
                      className="btn-snake"
                    >
                      Publish
                    </button>
                  )}
                  {entry.pullRequestId && (
                    <button
                      type="button"
                      onClick={() => regenerate(entry)}
                      disabled={isBusy}
                      className="btn-ghost"
                    >
                      Regenerate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    disabled={isBusy}
                    className="btn-ghost text-red-300 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
