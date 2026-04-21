import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: Props) {
  return (
    <details className="group" {...(defaultOpen ? { open: true } : {})}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#18181b] px-6 py-5 transition-colors hover:border-zinc-700 group-open:rounded-b-none group-open:border-b-0">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          )}
        </div>
        <svg
          className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="space-y-8 rounded-b-xl border border-t-0 border-zinc-800 bg-[#18181b]/30 p-6">
        {children}
      </div>
    </details>
  );
}
