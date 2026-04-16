"use client";

import { useEffect, useState } from "react";
import GeneratePrButton from "@/components/generate-pr-button";

interface PullRequestRow {
  id: string;
  status: string;
  branchName: string;
  githubPrUrl: string | null;
  githubPrNumber: number | null;
  workflowRunUrl: string | null;
  createdAt: string;
}

interface Props {
  feedbackId: string;
  initialStatus: string;
  initialRuns: PullRequestRow[];
}

const feedbackBadge: Record<string, string> = {
  new: "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20",
  reviewing: "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20",
  generating:
    "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  pr_created:
    "bg-green-500/10 text-green-400 ring-1 ring-green-500/20",
  closed: "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20",
};

const prBadge: Record<string, string> = {
  open: "bg-green-500/10 text-green-400 ring-1 ring-green-500/20",
  merged:
    "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20",
  pending:
    "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  closed: "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20",
  failed: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
  canceled:
    "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20",
};

export default function FeedbackRuns({
  feedbackId,
  initialStatus,
  initialRuns,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [runs, setRuns] = useState<PullRequestRow[]>(initialRuns);

  const shouldPoll =
    status === "generating" || runs.some((r) => r.status === "pending");

  useEffect(() => {
    if (!shouldPoll) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/feedback/${feedbackId}/sync`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.status) setStatus(data.status);
        if (Array.isArray(data.pullRequests)) setRuns(data.pullRequests);
      } catch {
        // swallow
      }
    }

    poll();
    const iv = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [feedbackId, shouldPoll]);

  const canGenerate =
    status === "new" ||
    status === "reviewing" ||
    status === "closed" ||
    status === "pr_created";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium capitalize ${
            feedbackBadge[status] || feedbackBadge.closed
          }`}
        >
          {status === "generating" && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
              style={{ animation: "pulse-dot 1.5s ease infinite" }}
            />
          )}
          {status.replace("_", " ")}
        </span>
        {canGenerate && <GeneratePrButton feedbackId={feedbackId} />}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-3">
          Agent runs
        </h2>
        {runs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
            <p className="text-sm text-zinc-500">
              No runs yet. Click &ldquo;Generate PR&rdquo; to kick off the
              agent.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((pr) => (
              <div
                key={pr.id}
                className="rounded-xl border border-zinc-800 bg-[#111113] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-100 font-mono text-sm break-all">
                      {pr.branchName || "(pending)"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                      <span>
                        {new Date(pr.createdAt).toLocaleString()}
                      </span>
                      {pr.githubPrUrl && (
                        <a
                          href={pr.githubPrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          PR #{pr.githubPrNumber} &rarr;
                        </a>
                      )}
                      {pr.workflowRunUrl && (
                        <a
                          href={pr.workflowRunUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-zinc-200"
                        >
                          Workflow run &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      prBadge[pr.status] || prBadge.closed
                    }`}
                  >
                    {pr.status === "pending" && (
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"
                        style={{
                          animation: "pulse-dot 1.5s ease infinite",
                        }}
                      />
                    )}
                    {pr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
