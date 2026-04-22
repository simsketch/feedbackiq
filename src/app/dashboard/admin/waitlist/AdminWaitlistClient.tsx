"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface Signup {
  id: string;
  email: string;
  source: string | null;
  referrer: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Summary {
  total: number;
  last24h: number;
  last7d: number;
  uniqueSources: number;
}

interface DataShape {
  summary: Summary;
  signups: Signup[];
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shortUA(ua: string | null): string {
  if (!ua) return "—";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return ua.slice(0, 40);
}

function toCsv(rows: Signup[]): string {
  const header = ["email", "source", "referrer", "userAgent", "createdAt"];
  const escape = (v: string | null) => {
    const s = v ?? "";
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const body = rows.map((r) =>
    [r.email, r.source, r.referrer, r.userAgent, r.createdAt]
      .map(escape)
      .join(",")
  );
  return [header.join(","), ...body].join("\n");
}

interface DripResult {
  ok: boolean;
  subscribers?: number;
  sent?: number;
  errors?: number;
  errorDetails?: Array<{ email: string; seq: number; message: string }>;
  error?: string;
}

export default function AdminWaitlistClient() {
  const [data, setData] = useState<DataShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dripStatus, setDripStatus] = useState<
    "idle" | "running" | "done" | "error"
  >("idle");
  const [dripResult, setDripResult] = useState<DripResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/waitlist");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as DataShape;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sources = useMemo(() => {
    if (!data) return [] as string[];
    const set = new Set<string>();
    for (const s of data.signups) set.add(s.source ?? "unknown");
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.signups.filter((s) => {
      if (sourceFilter !== "all" && (s.source ?? "unknown") !== sourceFilter) {
        return false;
      }
      if (!q) return true;
      return (
        s.email.toLowerCase().includes(q) ||
        (s.referrer ?? "").toLowerCase().includes(q) ||
        (s.source ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, query, sourceFilter]);

  const runDrip = useCallback(async () => {
    setDripStatus("running");
    setDripResult(null);
    try {
      const res = await fetch("/api/admin/waitlist/run-drip", { method: "POST" });
      const json = (await res.json()) as DripResult;
      if (!res.ok) {
        setDripResult({ ok: false, error: json.error ?? `HTTP ${res.status}` });
        setDripStatus("error");
        return;
      }
      setDripResult(json);
      setDripStatus("done");
      load();
    } catch (err) {
      setDripResult({
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      });
      setDripStatus("error");
    }
  }, [load]);

  const exportCsv = useCallback(() => {
    if (!data) return;
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data, filtered]);

  if (loading && !data) {
    return <p className="text-sm text-zinc-500">Loading signups…</p>;
  }

  if (error) {
    return (
      <div className="glow-card rounded-xl p-6">
        <p className="text-sm text-red-400">Error loading: {error}</p>
        <button
          onClick={load}
          className="mt-3 rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={data.summary.total} accent />
        <StatCard label="Last 24h" value={data.summary.last24h} />
        <StatCard label="Last 7 days" value={data.summary.last7d} />
        <StatCard label="Unique sources" value={data.summary.uniqueSources} />
      </div>

      <div className="glow-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Drip sequence</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Manually runs the same job the cron runs daily at 13:00 UTC. Safe
              to run repeatedly — idempotent per subscriber/issue.
            </p>
          </div>
          <button
            onClick={runDrip}
            disabled={dripStatus === "running"}
            className="btn-snake inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-medium text-black transition-all hover:brightness-110 disabled:opacity-60"
          >
            {dripStatus === "running" ? "Running…" : "Run drip now"}
          </button>
        </div>
        {dripResult && (
          <div className="mt-4 rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">
            {dripResult.ok ? (
              <p>
                Processed <strong>{dripResult.subscribers ?? 0}</strong>{" "}
                subscribers, sent <strong>{dripResult.sent ?? 0}</strong>{" "}
                emails, <strong>{dripResult.errors ?? 0}</strong> errors.
              </p>
            ) : (
              <p className="text-red-400">
                Drip failed: {dripResult.error ?? "unknown"}
              </p>
            )}
            {(dripResult.errorDetails?.length ?? 0) > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-zinc-400">
                {dripResult.errorDetails!.slice(0, 5).map((e, i) => (
                  <li key={i}>
                    {e.email} · issue #{e.seq}: {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email, source, referrer…"
            className="w-72 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
          />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60"
          >
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
          >
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            Export CSV ({filtered.length})
          </button>
        </div>
      </div>

      <div className="glow-card overflow-x-auto rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/70 text-left">
              <Th>Email</Th>
              <Th>Source</Th>
              <Th>Referrer</Th>
              <Th>Client</Th>
              <Th>Signed up</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-b border-zinc-800/40 last:border-b-0"
              >
                <Td>
                  <span className="font-mono text-[13px] text-white">
                    {s.email}
                  </span>
                </Td>
                <Td>
                  {s.source ? (
                    <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] text-cyan-300">
                      {s.source}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </Td>
                <Td>
                  {s.referrer ? (
                    <span
                      title={s.referrer}
                      className="block max-w-xs truncate text-zinc-400"
                    >
                      {s.referrer}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </Td>
                <Td>
                  <span className="text-zinc-400">{shortUA(s.userAgent)}</span>
                </Td>
                <Td>
                  <span className="text-zinc-300">
                    {formatDateTime(s.createdAt)}
                  </span>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  {data.signups.length === 0
                    ? "No signups yet. The first one is always the hardest."
                    : "No signups match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="glow-card rounded-xl p-5">
      <p
        className={`font-mono text-[11px] uppercase tracking-wider ${
          accent ? "text-cyan-400" : "text-zinc-500"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-wider text-zinc-500">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3">{children}</td>;
}
