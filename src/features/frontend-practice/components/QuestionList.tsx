import { useId } from "react";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import type { Exercise } from "../data/types";
import { applyFilters, type Filters } from "../data/filters";
import { DIFFICULTIES, TOPICS } from "../data/topics";
import { DifficultyBadge } from "./ProblemPanel";

interface QuestionListProps {
  exercises: Exercise[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  activeId?: string;
  onSelect: (id: string) => void;
  isSolved: (id: string) => boolean;
  isAttempted: (id: string) => boolean;
}

export default function QuestionList({
  exercises,
  filters,
  onFiltersChange,
  activeId,
  onSelect,
  isSolved,
  isAttempted,
}: QuestionListProps) {
  const topicId = useId();
  const visible = applyFilters(exercises, filters);
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium ${
      active ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text hover:bg-app-cream"
    }`;

  return (
    <nav aria-label="Questions" className="flex flex-col gap-4">
      <div role="group" aria-label="Exercise type" className="grid grid-cols-3 gap-1 rounded-xl bg-app-cream-dark p-1 text-xs font-semibold">
        {([
          ["all", "All"],
          ["debug", "Fix bugs"],
          ["build", "Build"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filters.kind === value}
            onClick={() => onFiltersChange({ ...filters, kind: value })}
            className={`rounded-lg px-2 py-1.5 ${filters.kind === value ? "bg-white text-app-green shadow-sm" : "text-app-text-light hover:text-app-green"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor={topicId}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-app-text-light"
        >
          Topic
        </label>
        <select
          id={topicId}
          value={filters.topic}
          onChange={(e) => onFiltersChange({ ...filters, topic: e.target.value as Filters["topic"] })}
          className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">All topics</option>
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div role="group" aria-label="Difficulty" className="flex flex-wrap gap-2">
        <button
          aria-pressed={filters.difficulty === "all"}
          className={chip(filters.difficulty === "all")}
          onClick={() => onFiltersChange({ ...filters, difficulty: "all" })}
        >
          All levels
        </button>
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            aria-pressed={filters.difficulty === d.id}
            className={chip(filters.difficulty === d.id)}
            onClick={() => onFiltersChange({ ...filters, difficulty: d.id })}
          >
            {d.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-app-text-light" aria-live="polite">
        {visible.length} {visible.length === 1 ? "question" : "questions"}
      </p>

      <ul className="flex flex-col gap-1.5">
        {visible.map((e) => {
          const active = e.id === activeId;
          const solved = isSolved(e.id);
          const attempted = !solved && isAttempted(e.id);
          return (
            <li key={e.id}>
              <button
                onClick={() => onSelect(e.id)}
                aria-current={active ? "true" : undefined}
                className={`flex w-full items-start gap-2 rounded-xl border p-3 text-left ${
                  active ? "border-app-orange bg-orange-50" : "border-transparent bg-white hover:border-app-border"
                }`}
              >
                {solved ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-app-success" aria-label="Solved" />
                ) : attempted ? (
                  <CircleDot className="mt-0.5 size-4 shrink-0 text-app-warning" aria-label="Attempted" />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-app-border" aria-label="Not started" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-snug text-app-green">{e.title}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <DifficultyBadge difficulty={e.difficulty} />
                    {e.kind === "build" && (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">Build</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="rounded-xl bg-white p-4 text-sm text-app-text-light">No questions match these filters.</li>
        )}
      </ul>
    </nav>
  );
}
