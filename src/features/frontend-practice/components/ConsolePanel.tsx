import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import type { ConsoleEntry } from "../runner/console";

export type LoggedEntry = ConsoleEntry & { id: number };

const LEVEL_STYLE: Record<string, string> = {
  log: "text-slate-100",
  info: "text-sky-300",
  debug: "text-slate-400",
  warn: "bg-amber-950/40 text-amber-200",
  error: "bg-red-950/50 text-red-200",
};

interface ConsolePanelProps {
  entries: LoggedEntry[];
  onClear: () => void;
}

/** Output of console.log / info / warn / error from the running preview and from test runs. */
export default function ConsolePanel({ entries, onClear }: ConsolePanelProps) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "nearest" });
  }, [entries.length]);

  return (
    <div className="flex h-full min-h-[200px] flex-col bg-[#101a14] font-mono text-xs">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-white/60">
        <span>{entries.length === 0 ? "Console is empty" : `${entries.length} message${entries.length === 1 ? "" : "s"}`}</span>
        <button
          onClick={onClear}
          disabled={entries.length === 0}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-white/10 disabled:opacity-40"
        >
          <Trash2 className="size-3" /> Clear
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto" aria-label="Console output">
        {entries.length === 0 && (
          <li className="px-3 py-4 text-white/45">
            console.log / warn / error from your code appear here. Press Run, or Run Tests to see output from the test run.
          </li>
        )}
        {entries.map((entry) => (
          <li
            key={entry.id}
            data-level={entry.level}
            className={`flex gap-2 whitespace-pre-wrap break-words border-b border-white/5 px-3 py-1.5 ${LEVEL_STYLE[entry.level] ?? ""}`}
          >
            <span className="w-10 shrink-0 text-white/40">{entry.level === "log" ? "" : entry.level}</span>
            <span className="min-w-0 flex-1">{entry.text}</span>
            {entry.source === "tests" && <span className="shrink-0 text-white/30">tests</span>}
          </li>
        ))}
      </ul>
      <div ref={end} />
    </div>
  );
}
