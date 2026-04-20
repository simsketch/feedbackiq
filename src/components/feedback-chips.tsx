const priorityClass: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  low: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const categoryClass: Record<string, string> = {
  bug: "bg-red-500/10 text-red-400 border-red-500/20",
  feature: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  ux: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  performance: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  auth: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  content: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  other: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

interface Props {
  priority?: string | null;
  category?: string | null;
  tags?: string[];
  size?: "sm" | "md";
}

export default function FeedbackChips({
  priority,
  category,
  tags = [],
  size = "sm",
}: Props) {
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  if (!priority && !category && tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {priority && (
        <span
          className={`inline-flex items-center rounded-full border font-medium ${pad} ${
            priorityClass[priority] || priorityClass.medium
          }`}
        >
          {priority}
        </span>
      )}
      {category && (
        <span
          className={`inline-flex items-center rounded-full border font-medium ${pad} ${
            categoryClass[category] || categoryClass.other
          }`}
        >
          {category}
        </span>
      )}
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center rounded-full border border-zinc-700/60 bg-zinc-800/40 font-mono text-zinc-400 ${pad}`}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
