import Link from "next/link";
import type { SimilarFeedback } from "@/lib/find-similar";

interface Props {
  projectId: string;
  items: SimilarFeedback[];
}

const statusBadge: Record<string, string> = {
  new: "bg-cyan-500/10 text-cyan-400",
  reviewing: "bg-cyan-500/10 text-cyan-400",
  generating: "bg-amber-500/10 text-amber-400",
  pr_created: "bg-green-500/10 text-green-400",
  closed: "bg-zinc-500/10 text-zinc-400",
};

export default function SimilarFeedback({ projectId, items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"
          />
        </svg>
        <h4 className="text-sm font-semibold text-amber-300">
          {items.length === 1
            ? "Looks similar to 1 existing item"
            : `Looks similar to ${items.length} existing items`}
        </h4>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/projects/${projectId}/feedback/${item.id}`}
            className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3 transition-colors hover:border-zinc-700"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-200">{item.content}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {new Date(item.createdAt).toLocaleDateString()} ·{" "}
                {Math.round(item.similarity * 100)}% match
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                statusBadge[item.status] || "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              {item.status.replace("_", " ")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
