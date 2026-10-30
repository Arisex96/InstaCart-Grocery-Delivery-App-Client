import { useState } from "react";
import { Check, ChevronRight, Copy, Eye, FileCode2, Lightbulb, Lock } from "lucide-react";
import type { Exercise } from "../data/types";
import { topicLabel } from "../data/topics";
import CodeEditor from "./CodeEditor";

type Tab = "problem" | "hints" | "solution";

interface ProblemPanelProps {
  exercise: Exercise;
  hintsShown: number;
  onRevealHint: () => void;
  solutionRevealed: boolean;
  onRevealSolution: () => void;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-rose-100 text-rose-800",
};

export const DifficultyBadge = ({ difficulty }: { difficulty: string }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${DIFFICULTY_STYLE[difficulty]}`}>
    {difficulty}
  </span>
);

const Section = ({ title, items, ordered }: { title: string; items?: string[]; ordered?: boolean }) => {
  if (!items?.length) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-app-text-light">{title}</h3>
      <List className={`space-y-1.5 pl-5 text-sm text-app-text ${ordered ? "list-decimal" : "list-disc"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    </section>
  );
};

export default function ProblemPanel({
  exercise,
  hintsShown,
  onRevealHint,
  solutionRevealed,
  onRevealSolution,
}: ProblemPanelProps) {
  const [tab, setTab] = useState<Tab>("problem");
  const [copied, setCopied] = useState(false);
  const [solutionFile, setSolutionFile] = useState(exercise.editableFiles[0]);
  const tabs: { id: Tab; label: string }[] = [
    { id: "problem", label: "Problem" },
    { id: "hints", label: `Hints (${hintsShown}/${exercise.hints.length})` },
    { id: "solution", label: "Solution" },
  ];
  const shownSolution = exercise.files.find((f) => f.path === solutionFile) ?? exercise.files[0];
  const solutionFiles = exercise.files.filter((f) => f.editable);

  const copySolution = async () => {
    try {
      await navigator.clipboard.writeText(shownSolution.solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; the code is still selectable on screen.
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-app-border bg-white">
      <div role="tablist" aria-label="Exercise sections" className="flex gap-1 border-b border-app-border px-3 pt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-3 py-2 text-sm font-medium ${
              tab === t.id ? "border-b-2 border-app-orange text-app-green" : "text-app-text-light hover:text-app-green"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5" role="tabpanel">
        {tab === "problem" && (
          <article>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={exercise.difficulty} />
              <span className="rounded-full bg-app-cream-dark px-2.5 py-0.5 text-[11px] font-semibold text-app-green">
                {topicLabel(exercise.topic)}
              </span>
              {exercise.kind === "build" && (
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                  Build a feature
                </span>
              )}
              {exercise.mode === "write-tests" && (
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                  Write the tests
                </span>
              )}
              {exercise.minutes && <span className="text-xs text-app-text-light">~{exercise.minutes} min</span>}
            </div>
            <h2 className="font-serif text-2xl text-app-green">{exercise.title}</h2>
            {exercise.scenario.split("\n\n").map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-app-text">
                {p}
              </p>
            ))}

            <section className="mt-4 rounded-xl bg-app-cream p-3 text-xs text-app-text-light">
              <p className="mb-1 font-semibold text-app-text">Files you will work in</p>
              <ul className="space-y-0.5">
                {exercise.editableFiles.map((p) => (
                  <li key={p} className="flex items-center gap-1.5 font-mono">
                    <FileCode2 className="size-3.5 text-app-orange" /> {p}
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                Modelled on: {exercise.inspiredBy.map((p) => p.replace(/^client\//, "")).join(", ")}
              </p>
            </section>

            {exercise.kind === "build" && <Section title="UI requirements" items={exercise.uiSpec} />}
            <Section title={exercise.kind === "build" ? "What it should do" : "Expected behavior"} items={exercise.expectedBehavior} />
            <Section title={exercise.kind === "build" ? "How to try it" : "How to reproduce"} items={exercise.reproSteps} ordered />
            <Section title="Acceptance criteria" items={exercise.acceptanceCriteria} />
            <Section title="Edge cases" items={exercise.edgeCases} />
          </article>
        )}

        {tab === "hints" && (
          <div>
            <p className="mb-4 text-sm text-app-text-light">
              Hints are revealed one at a time. Your code in the editor is never changed.
            </p>
            <ol className="space-y-3">
              {exercise.hints.slice(0, hintsShown).map((hint, i) => (
                <li key={hint} className="flex gap-3 rounded-xl bg-amber-50 p-3 text-sm text-app-text">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-app-warning" />
                  <span>
                    <strong>Hint {i + 1}.</strong> {hint}
                  </span>
                </li>
              ))}
            </ol>
            {hintsShown < exercise.hints.length ? (
              <button
                onClick={onRevealHint}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-app-border px-4 py-2 text-sm font-medium text-app-green hover:bg-app-cream"
              >
                <ChevronRight className="size-4" />
                Show hint {hintsShown + 1} of {exercise.hints.length}
              </button>
            ) : (
              <p className="mt-4 text-sm text-app-text-light">No more hints — try the solution tab if you are stuck.</p>
            )}
          </div>
        )}

        {tab === "solution" &&
          (solutionRevealed ? (
            <div>
              <h3 className="font-serif text-xl text-app-green">{exercise.kind === "build" ? "Approach" : "Why it was broken"}</h3>
              <p className="mt-2 text-sm leading-relaxed">{exercise.explanation.rootCause}</p>
              <h3 className="mt-5 font-serif text-xl text-app-green">The fix</h3>
              <p className="mt-2 text-sm leading-relaxed">{exercise.explanation.fix}</p>
              {exercise.explanation.takeaways && <Section title="Takeaways" items={exercise.explanation.takeaways} />}
              <div className="mb-2 mt-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-app-text-light">
                  Reference solution (read-only)
                </h3>
                <button
                  onClick={copySolution}
                  className="inline-flex items-center gap-1.5 rounded-full border border-app-border px-3 py-1 text-xs font-medium hover:bg-app-cream"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy file"}
                </button>
              </div>
              {solutionFiles.length > 1 && (
                <div role="tablist" aria-label="Solution files" className="mb-2 flex flex-wrap gap-1">
                  {solutionFiles.map((f) => (
                    <button
                      key={f.path}
                      role="tab"
                      aria-selected={f.path === shownSolution.path}
                      onClick={() => setSolutionFile(f.path)}
                      className={`rounded-full border px-3 py-1 font-mono text-xs ${
                        f.path === shownSolution.path ? "border-app-green bg-app-green text-white" : "border-app-border"
                      }`}
                    >
                      {f.path.slice(f.path.lastIndexOf("/") + 1)}
                    </button>
                  ))}
                </div>
              )}
              <CodeEditor
                key={shownSolution.path}
                value={shownSolution.solution}
                readOnly
                label={`Reference solution: ${shownSolution.path}`}
                height={420}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Lock className="size-8 text-app-text-light" />
              <p className="max-w-sm text-sm text-app-text-light">
                Try the exercise and the hints first. Viewing the solution won't change or reset your code, and it does
                not mark the exercise as solved — only passing the tests does.
              </p>
              <button
                onClick={onRevealSolution}
                className="inline-flex items-center gap-2 rounded-full bg-app-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light"
              >
                <Eye className="size-4" /> Reveal solution
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
