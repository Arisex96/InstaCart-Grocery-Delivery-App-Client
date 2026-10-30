import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, FlaskConical, Link2, Maximize2, Minimize2, Play, RotateCcw, Square } from "lucide-react";
import { EXERCISES } from "./data/registry";
import { hasPreview, type Exercise } from "./data/types";
import { applyFilters, type Filters } from "./data/filters";
import { checkExercise, prepareRun, solutionFiles, starterFiles, type SuiteRunner, type WorkspaceFiles } from "./runner/exerciseRunner";
import { sandboxRunner } from "./runner/sandbox";
import { describeProblem } from "./runner/transpile";
import type { TestReport } from "./runner/engine";
import type { ConsoleEntry } from "./runner/console";
import { usePracticeProgress } from "./hooks/usePracticeProgress";
import { useSyntaxProblems } from "./hooks/useSyntaxProblems";
import { useSplitter } from "./hooks/useSplitter";
import ConsolePanel, { type LoggedEntry } from "./components/ConsolePanel";
import EditorPanel from "./components/EditorPanel";
import PreviewFrame, { type PreviewHandle, type PreviewStatus } from "./components/PreviewFrame";
import ProblemPanel from "./components/ProblemPanel";
import QuestionList from "./components/QuestionList";
import ResultsPanel from "./components/ResultsPanel";

interface PracticeLabProps {
  exercises?: Exercise[];
  /** Where tests run. Defaults to the sandboxed iframe. */
  runner?: SuiteRunner;
}

type OutputTab = "preview" | "target" | "console" | "tests";

const MAX_CONSOLE_ENTRIES = 500;

export default function PracticeLab({ exercises = EXERCISES, runner = sandboxRunner }: PracticeLabProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const progress = usePracticeProgress(exercises);
  const splitter = useSplitter();
  const previewRef = useRef<PreviewHandle>(null);
  const targetRef = useRef<PreviewHandle>(null);
  const logId = useRef(0);

  const [filters, setFilters] = useState<Filters>({ topic: "all", difficulty: "all", kind: "all" });
  const [reports, setReports] = useState<Record<string, TestReport>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<OutputTab>("preview");
  const [logs, setLogs] = useState<Record<string, LoggedEntry[]>>({});
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("booting");
  const [confirmReset, setConfirmReset] = useState(false);
  // Focus mode hides the question list and the problem text: editor on the left, preview/console/tests on the right.
  const [focus, setFocus] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const exercise = exercises.find((e) => e.id === id) ?? exercises[0];
  const visible = useMemo(() => applyFilters(exercises, filters), [exercises, filters]);
  const position = visible.findIndex((e) => e.id === exercise?.id);

  const files = exercise ? progress.getFiles(exercise.id) : {};
  const problems = useSyntaxProblems(files, exercise?.editableFiles ?? []);

  const select = useCallback(
    (nextId: string) => {
      setConfirmReset(false);
      navigate(`/practice/${nextId}`);
    },
    [navigate],
  );

  const appendLog = useCallback((exerciseId: string, entry: ConsoleEntry) => {
    setLogs((all) => {
      const next = [...(all[exerciseId] ?? []), { ...entry, id: ++logId.current }];
      return { ...all, [exerciseId]: next.slice(-MAX_CONSOLE_ENTRIES) };
    });
  }, []);

  const clearLogs = useCallback((exerciseId: string, source?: ConsoleEntry["source"]) => {
    setLogs((all) => ({ ...all, [exerciseId]: source ? (all[exerciseId] ?? []).filter((e) => e.source !== source) : [] }));
  }, []);

  if (!exercise) {
    return <p className="p-8 text-center text-app-text-light">No practice questions are available.</p>;
  }

  /** Shareable deep link to this question; works on any host that serves the app (every path falls back to index.html). */
  const copyLink = async () => {
    const url = `${window.location.origin}/practice/${exercise.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const ui = hasPreview(exercise);
  const writeTests = exercise.mode === "write-tests";
  const entries = logs[exercise.id] ?? [];
  const running = runningId === exercise.id;
  const build = exercise.kind === "build" && ui;
  const activeTab: OutputTab =
    (!ui && outputTab === "preview") || (!build && outputTab === "target") ? (ui ? "preview" : "console") : outputTab;

  /** Renders the reference solution so the learner can compare the target UI (its code stays hidden). */
  const runTarget = () => {
    const prepared = prepareRun(exercise, solutionFiles(exercise));
    if (prepared.ok) targetRef.current?.run({ modules: prepared.modules, entry: prepared.entry, ui: true });
  };

  /** Run / preview: executes the CURRENT editor contents (never the solution). */
  const runCode = (override?: WorkspaceFiles) => {
    if (writeTests) return;
    const source = override ?? files;
    progress.markAttempted(exercise.id);
    clearLogs(exercise.id, "preview");
    const prepared = prepareRun(exercise, source);
    if (!prepared.ok) {
      const message = describeProblem(prepared.problem);
      appendLog(exercise.id, { level: "error", text: message, source: "preview" });
      previewRef.current?.fail(message);
      setOutputTab("console");
      return;
    }
    previewRef.current?.run({ modules: prepared.modules, entry: prepared.entry, ui: prepared.ui });
    setOutputTab(ui ? "preview" : "console");
  };

  const runTests = async () => {
    if (runningId) return;
    const target = exercise;
    setRunningId(target.id);
    setOutputTab("tests");
    progress.markAttempted(target.id);
    clearLogs(target.id, "tests");
    const report = await checkExercise(target, files, runner, { onConsole: (entry) => appendLog(target.id, entry) });
    setReports((r) => ({ ...r, [target.id]: report }));
    setRunningId(null);
    if (!report.error && report.results.length > 0 && report.results.every((t) => t.status === "pass")) {
      progress.markSolved(target.id);
    }
  };

  const reset = () => {
    progress.resetExercise(exercise.id);
    setReports((r) => {
      const next = { ...r };
      delete next[exercise.id];
      return next;
    });
    setConfirmReset(false);
    runCode(starterFiles(exercise));
  };

  const step = (delta: number) => {
    const target = visible[position + delta];
    if (target) select(target.id);
  };

  const errorCount = entries.filter((e) => e.level === "error").length;
  const report = reports[exercise.id];
  const passed = report?.results.filter((r) => r.status === "pass").length ?? 0;

  const tabButton = (tab: OutputTab, label: string, badge?: React.ReactNode) => (
    <button
      role="tab"
      aria-selected={activeTab === tab}
      onClick={() => setOutputTab(tab)}
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${
        activeTab === tab ? "border-b-2 border-app-orange text-app-green" : "text-app-text-light hover:text-app-green"
      }`}
    >
      {label}
      {badge}
    </button>
  );

  const list = (
    <QuestionList
      exercises={exercises}
      filters={filters}
      onFiltersChange={setFilters}
      activeId={exercise.id}
      onSelect={select}
      isSolved={progress.isSolved}
      isAttempted={progress.isAttempted}
    />
  );

  return (
    <div className="min-h-screen bg-app-cream">
      <header className="border-b border-app-border bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green">
            <ArrowLeft className="size-4" /> Back to store
          </Link>
          <h1 className="flex items-center gap-2 font-serif text-xl text-app-green">
            <FlaskConical className="size-5 text-app-orange" /> Frontend Practice Lab
          </h1>
          <span className="ml-auto text-sm text-app-text-light" data-testid="progress">
            {progress.solvedCount} / {exercises.length} solved
            {progress.attemptedCount > 0 && ` · ${progress.attemptedCount} in progress`}
          </span>
          <button
            onClick={copyLink}
            title="Copy a link to this question to share with friends"
            className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-white px-3 py-1.5 text-sm font-medium text-app-green hover:bg-app-cream"
          >
            <Link2 className="size-4" />
            <span role="status">{linkCopied ? "Link copied" : "Copy link"}</span>
          </button>
          <button
            onClick={() => setFocus((f) => !f)}
            aria-pressed={focus}
            title={focus ? "Show the question list and description" : "Hide the question list and description"}
            className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-white px-3 py-1.5 text-sm font-medium text-app-green hover:bg-app-cream"
          >
            {focus ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            {focus ? "Show panels" : "Focus mode"}
          </button>
        </div>
      </header>

      <div
        className={`mx-auto grid gap-4 p-4 ${focus ? "max-w-[2000px]" : "max-w-[1600px] lg:grid-cols-[250px_minmax(0,1fr)]"}`}
      >
        {!focus && (
        <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
          {/* Small screens: collapsible list. Large screens: always visible. */}
          <details className="lg:hidden">
            <summary className="cursor-pointer rounded-xl border border-app-border bg-white px-4 py-2 text-sm font-medium">
              Browse questions ({visible.length})
            </summary>
            <div className="mt-3">{list}</div>
          </details>
          <div className="hidden lg:block">{list}</div>
        </aside>
        )}

        <main
          className={`grid min-w-0 gap-4 ${focus ? "" : "xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"}`}
          key={exercise.id}
        >
          {/* On wide screens the problem stays in view and scrolls on its own, so long statements are never clipped. */}
          {!focus && (
          <div className="min-w-0 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:self-start">
            <ProblemPanel
              exercise={exercise}
              hintsShown={progress.hintsShown(exercise.id)}
              onRevealHint={() => progress.revealHint(exercise.id, exercise.hints.length)}
              solutionRevealed={progress.solutionRevealed(exercise.id)}
              onRevealSolution={() => progress.revealSolution(exercise.id)}
            />
          </div>
          )}

          <div className={`flex min-w-0 flex-col gap-3 ${focus ? "xl:grid xl:grid-cols-2 xl:items-start" : ""}`}>
            <div className={`flex flex-wrap items-center gap-2 ${focus ? "xl:col-span-2" : ""}`}>
              <span className="mr-auto text-xs text-app-text-light">
                {progress.isModified(exercise.id) ? "You have edits in this exercise" : "Starter code"}
              </span>
              <button
                onClick={() => step(-1)}
                disabled={position <= 0}
                aria-label="Previous question"
                className="rounded-full border border-app-border bg-white p-2 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => step(1)}
                disabled={position < 0 || position >= visible.length - 1}
                aria-label="Next question"
                className="rounded-full border border-app-border bg-white p-2 disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
              {confirmReset ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm">
                  Discard your edits?
                  <button onClick={reset} className="font-semibold text-app-error">
                    Yes, reset
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="text-app-text-light">
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-white px-3 py-2 text-sm"
                >
                  <RotateCcw className="size-4" /> Reset
                </button>
              )}
              {!writeTests && (
                <button
                  onClick={() => runCode()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-app-green bg-white px-4 py-2 text-sm font-semibold text-app-green hover:bg-app-cream"
                  title="Run your code (Ctrl/⌘ + Enter)"
                >
                  <Play className="size-4" /> Run
                </button>
              )}
              <button
                onClick={runTests}
                disabled={Boolean(runningId)}
                className="inline-flex items-center gap-1.5 rounded-full bg-app-orange px-4 py-2 text-sm font-semibold text-white hover:bg-app-orange-dark disabled:opacity-60"
              >
                <Square className="size-3.5" /> Run Tests
              </button>
            </div>

            <EditorPanel
              exercise={exercise}
              files={files}
              onChange={(path, content) => progress.setFile(exercise.id, path, content)}
              onRun={() => (writeTests ? void runTests() : runCode())}
              problems={problems}
              isFileModified={(path) => progress.isFileModified(exercise.id, path)}
              height={focus ? Math.max(460, window.innerHeight - 300) : splitter.height}
            />

            {!focus && (
            <div
              {...splitter.handleProps}
              title="Drag (or use ↑ ↓) to resize the editor"
              className="mx-auto -my-1 h-2 w-24 cursor-row-resize rounded-full bg-app-border hover:bg-app-orange/60 focus-visible:bg-app-orange"
            />
            )}

            <section className="overflow-hidden rounded-2xl border border-app-border bg-white">
              <div role="tablist" aria-label="Output" className="flex items-center border-b border-app-border">
                {ui && tabButton("preview", build ? "Your build" : "Preview")}
                {build && tabButton("target", "Target UI")}
                {tabButton(
                  "console",
                  "Console",
                  entries.length > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-bold ${
                        errorCount > 0 ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {entries.length}
                    </span>
                  ),
                )}
                {tabButton(
                  "tests",
                  "Tests",
                  report &&
                    !report.error && (
                      <span
                        className={`rounded-full px-1.5 text-[10px] font-bold ${
                          passed === report.results.length ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {passed}/{report.results.length}
                      </span>
                    ),
                )}
                {previewStatus === "booting" && !writeTests && (
                  <span className="ml-auto mr-3 text-xs text-app-text-light">Starting sandbox…</span>
                )}
              </div>

              <div role="tabpanel" className={`overflow-hidden ${focus ? "h-[calc(100vh-14rem)] min-h-[420px]" : "h-[420px]"}`}>
                {/* The preview stays mounted (just hidden) so it keeps its state while other tabs are open. */}
                {!writeTests && (
                  <div className={activeTab === "preview" ? "h-full" : "hidden"}>
                    <PreviewFrame
                      ref={previewRef}
                      ui={ui}
                      onConsole={(entry) => appendLog(exercise.id, entry)}
                      onReady={() => runCode()}
                      onStatus={(status) => setPreviewStatus(status)}
                    />
                  </div>
                )}
                {activeTab === "target" && (
                  <div className="h-full">
                    <p className="border-b border-app-border bg-sky-50 px-3 py-1.5 text-xs text-sky-900">
                      Reference rendering of the finished feature. Match it, then run the tests.
                    </p>
                    <PreviewFrame ref={targetRef} ui onConsole={() => undefined} onReady={runTarget} />
                  </div>
                )}
                {activeTab === "console" && (
                  <ConsolePanel entries={entries} onClear={() => clearLogs(exercise.id)} />
                )}
                {activeTab === "tests" && (
                  <div className="h-full overflow-y-auto">
                    <ResultsPanel report={report} running={running} />
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
