"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AgentRun } from "@tracebench/schemas";
import { Button, Panel, EmptyState, Kbd } from "@tracebench/ui";
import {
  deriveLogLines,
  downloadText,
  formatAuditTxt,
  formatLogsJsonl,
  formatLogsTxt,
  type LogLevel,
} from "@/lib/logs/derive-logs";
import {
  agentDisplayName,
  agentTone,
  sequenceAgents,
} from "@/lib/agents/colors";
import { HelpTip } from "@/components/help/HelpTip";

const LEVELS: Array<LogLevel | "all"> = [
  "all",
  "a2a",
  "debug",
  "info",
  "warn",
  "error",
  "audit",
  "tool",
];

const LEVEL_CLASS: Record<LogLevel, string> = {
  debug: "text-tb-text-dim",
  info: "text-tb-accent",
  warn: "text-tb-warning",
  error: "text-tb-danger",
  audit: "text-tb-success",
  tool: "text-tb-text-muted",
  a2a: "text-tb-success",
};

function AgentPill({
  agentId,
  label,
}: {
  agentId: string;
  label: string;
}) {
  const tone = agentTone(agentId);
  return (
    <span
      className="inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-medium"
      style={{ color: tone.fg, backgroundColor: tone.bg }}
      title={agentId}
    >
      {label}
    </span>
  );
}

export function RunLogs({
  run,
  isReplaying = false,
}: {
  run: AgentRun;
  isReplaying?: boolean;
}) {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");
  const [agentFilter, setAgentFilter] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [follow, setFollow] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const all = useMemo(() => deriveLogLines(run), [run]);
  const agents = useMemo(() => sequenceAgents(run), [run]);
  const multiAgent = agents.length >= 2;

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { all: all.length };
    for (const lv of LEVELS) {
      if (lv === "all") continue;
      counts[lv] = 0;
    }
    for (const l of all) {
      counts[l.level] = (counts[l.level] ?? 0) + 1;
    }
    return counts;
  }, [all]);

  const lines = useMemo(() => {
    return all.filter((l) => {
      if (level !== "all" && l.level !== level) return false;
      if (agentFilter) {
        if (l.level !== "a2a") return false;
        const involved =
          l.fromAgentId === agentFilter || l.toAgentId === agentFilter;
        if (!involved) return false;
      }
      if (
        q &&
        !l.message.toLowerCase().includes(q.toLowerCase()) &&
        !(l.fromAgentId?.includes(q)) &&
        !(l.toAgentId?.includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [all, level, q, agentFilter]);

  useEffect(() => {
    if (!follow || !isReplaying) return;
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length, follow, isReplaying]);

  // F = follow, / = focus search (skip when typing in inputs/textareas)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      const typing =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        t?.isContentEditable;
      if (typing) return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFollow((f) => !f);
      } else if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectAgent = (id: string) => {
    if (agentFilter === id) {
      setAgentFilter(null);
      setLevel("all");
    } else {
      setAgentFilter(id);
      setLevel("a2a");
    }
  };

  return (
    <div ref={rootRef}>
      {multiAgent && (
        <div
          className="mb-3 flex flex-wrap items-center gap-1.5 rounded-md border border-tb-border bg-tb-bg-elevated px-3 py-2"
          data-testid="a2a-sequence-strip"
          role="toolbar"
          aria-label="Agent sequence — click to filter A2A logs"
        >
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-tb-text-dim">
            Sequence
          </span>
          {agents.map((a, i) => (
            <span key={a.id} className="inline-flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-tb-text-dim" aria-hidden>
                  →
                </span>
              )}
              <button
                type="button"
                onClick={() => selectAgent(a.id)}
                data-testid={`a2a-seq-${a.id}`}
                aria-pressed={agentFilter === a.id}
                className={`tb-interactive rounded-sm border px-2 py-1 font-mono text-[11px] transition-colors ${
                  agentFilter === a.id
                    ? "border-tb-accent bg-tb-accent/15 text-tb-text"
                    : "border-tb-border bg-tb-bg text-tb-text-muted hover:border-tb-accent/40 hover:text-tb-text"
                }`}
                style={
                  agentFilter === a.id
                    ? {
                        borderColor: agentTone(a.id).fg,
                        color: agentTone(a.id).fg,
                      }
                    : undefined
                }
                title={`Filter A2A involving ${a.name}`}
              >
                {a.name}
              </button>
            </span>
          ))}
          {agentFilter && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-1"
              onClick={() => {
                setAgentFilter(null);
                setLevel("all");
              }}
              data-testid="a2a-seq-clear"
            >
              Clear
            </Button>
          )}
        </div>
      )}

      <Panel
        title="Logs"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <HelpTip
              title="Run logs"
              body="Derived from timeline, audit, and tools. A2A = agent-to-agent messages. Click a line to jump to the timeline. Download TXT or JSONL. F toggles follow; / focuses search."
              href="/help/anatomy-of-a-run"
            />
            <span className="hidden items-center gap-1 sm:inline-flex" title="Toggle follow">
              <Kbd>F</Kbd>
            </span>
            <Button
              size="sm"
              variant={follow ? "primary" : "ghost"}
              data-testid="logs-follow"
              onClick={() => setFollow((f) => !f)}
              aria-pressed={follow}
            >
              {follow ? "Following" : "Follow"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              data-testid="download-logs"
              onClick={() =>
                downloadText(`tracebench-${run.id}-logs.txt`, formatLogsTxt(run, all))
              }
            >
              .txt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              data-testid="download-logs-jsonl"
              onClick={() =>
                downloadText(
                  `tracebench-${run.id}-logs.jsonl`,
                  formatLogsJsonl(run, all),
                )
              }
            >
              .jsonl
            </Button>
            <Button
              size="sm"
              variant="ghost"
              data-testid="download-audit"
              onClick={() =>
                downloadText(`tracebench-${run.id}-audit.txt`, formatAuditTxt(run))
              }
            >
              Audit
            </Button>
          </div>
        }
      >
        <div
          className="sticky top-0 z-10 -mx-1 mb-3 flex flex-wrap items-center gap-2 border-b border-tb-border/60 bg-tb-bg-elevated/95 px-1 py-2 backdrop-blur-sm"
          data-testid="run-logs-filters"
        >
          {LEVELS.map((lv) => {
            const count = levelCounts[lv] ?? 0;
            const label = lv === "all" ? `all · ${count}` : `${lv} · ${count}`;
            return (
              <Button
                key={lv}
                size="sm"
                variant={level === lv && !agentFilter ? "primary" : "ghost"}
                onClick={() => {
                  setLevel(lv);
                  if (lv !== "a2a") setAgentFilter(null);
                }}
                data-testid={`log-filter-${lv}`}
                aria-label={`Filter ${lv}, ${count} lines`}
              >
                {label}
              </Button>
            );
          })}
          <div className="ml-auto flex min-w-[160px] items-center gap-1.5">
            <Kbd className="hidden sm:inline-flex">/</Kbd>
            <input
              ref={searchRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search logs…"
              data-testid="log-search"
              className="min-w-0 flex-1 rounded-sm border border-tb-border bg-tb-bg px-2 py-1 text-[12px] text-tb-text outline-none placeholder:text-tb-text-dim focus:border-tb-accent/50"
            />
          </div>
        </div>

        {lines.length === 0 ? (
          <EmptyState
            title="No log lines"
            description="Adjust the level filter, agent sequence, or search query."
          />
        ) : (
          <div
            ref={scrollerRef}
            data-testid="run-logs"
            className="max-h-[320px] overflow-auto rounded-sm border border-tb-border bg-tb-bg/60 font-mono text-[11px] leading-relaxed"
          >
            {lines.map((l) => (
              <div key={l.id} className="border-b border-tb-border/50 last:border-0">
                <button
                  type="button"
                  className="flex w-full gap-2 px-2.5 py-1.5 text-left hover:bg-tb-bg-hover/60"
                  data-log-level={l.level}
                  data-testid={`log-line-${l.id}`}
                  onClick={() => {
                    if (l.eventId) {
                      const el = document.getElementById(`tl-${l.eventId}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      el?.classList.add("ring-1", "ring-tb-accent");
                      window.setTimeout(
                        () => el?.classList.remove("ring-1", "ring-tb-accent"),
                        1200,
                      );
                    }
                    setExpanded((cur) => (cur === l.id ? null : l.id));
                  }}
                >
                  <time className="shrink-0 text-tb-text-dim tabular-nums">
                    {new Date(l.at).toISOString().slice(11, 23)}
                  </time>
                  <span
                    className={`w-12 shrink-0 uppercase ${LEVEL_CLASS[l.level]}`}
                    aria-label={`level ${l.level}`}
                  >
                    {l.level}
                  </span>
                  {l.level === "a2a" && l.fromAgentId && (
                    <span
                      className="inline-flex shrink-0 items-center gap-1"
                      data-testid="a2a-pills"
                    >
                      <AgentPill
                        agentId={l.fromAgentId}
                        label={agentDisplayName(run, l.fromAgentId)}
                      />
                      <span className="text-tb-text-dim" aria-hidden>
                        →
                      </span>
                      {l.toAgentId && (
                        <AgentPill
                          agentId={l.toAgentId}
                          label={agentDisplayName(run, l.toAgentId)}
                        />
                      )}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 break-all text-tb-text">
                    {l.message}
                  </span>
                </button>
                {expanded === l.id && l.raw !== undefined && (
                  <div className="border-t border-tb-border/40 bg-tb-bg px-2.5 py-2">
                    <div className="mb-1 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            JSON.stringify(l.raw, null, 2),
                          );
                        }}
                      >
                        Copy JSON
                      </Button>
                    </div>
                    <pre className="m-0 overflow-auto whitespace-pre-wrap text-[10px] text-tb-text-muted">
                      {JSON.stringify(l.raw, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
