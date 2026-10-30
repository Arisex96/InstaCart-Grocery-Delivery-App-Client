import { hasPreview, TESTS_PATH, type Exercise } from "../data/types";
import type { SuiteRequest, TestReport, TestResult } from "./engine";
import type { ConsoleEntry } from "./console";
import type { ModuleMap } from "./modules";
import { describeProblem, transpile, transpileAll, type SyntaxProblem } from "./transpile";

/** Something that can run one suite — the sandbox iframe or an in-process engine. */
export interface SuiteSession {
  run(request: SuiteRequest): Promise<TestReport>;
  dispose(): void;
}

export interface SessionOptions {
  /** Receives console output produced while the suite runs (sandbox only). */
  onConsole?: (entry: ConsoleEntry) => void;
}

export interface SuiteRunner {
  createSession(options?: SessionOptions): SuiteSession;
}

/** Current contents of every file in the workspace, by path. */
export type WorkspaceFiles = Record<string, string>;

const failure = (error: string): TestReport => ({ results: [], error, durationMs: 0 });

/** Replaces `find` in `source`; throws if the mutation target disappeared. */
export function applyMutation(source: string, find: string, replace: string): string {
  if (!source.includes(find)) {
    throw new Error(`Mutant target not found in subject: ${JSON.stringify(find)}`);
  }
  return source.replace(find, replace);
}

/** Starter contents of a workspace: what the learner sees on a fresh open. */
export const starterFiles = (e: Exercise): WorkspaceFiles => Object.fromEntries(e.files.map((f) => [f.path, f.starter]));
export const solutionFiles = (e: Exercise): WorkspaceFiles => Object.fromEntries(e.files.map((f) => [f.path, f.solution]));

/** Transpiles the workspace for the live preview / Run action. */
export function prepareRun(
  exercise: Exercise,
  files: WorkspaceFiles,
): { ok: true; modules: ModuleMap; entry: string; ui: boolean } | { ok: false; problem: SyntaxProblem } {
  const result = transpileAll(files);
  if (!result.ok) return result;
  return { ok: true, modules: result.modules, entry: exercise.previewEntry ?? exercise.editableFiles[0], ui: hasPreview(exercise) };
}

/**
 * Checks the learner's workspace against an exercise.
 *
 * - `fix` exercises: the workspace is the code under test and the exercise's
 *   hidden tests run against it.
 * - `write-tests` exercises: the learner's file *is* the test file. It must pass
 *   on the correct implementation and fail on every seeded mutant.
 */
export async function checkExercise(
  exercise: Exercise,
  files: WorkspaceFiles,
  runner: SuiteRunner,
  options?: SessionOptions,
): Promise<TestReport> {
  const session = runner.createSession(options);
  const started = performance.now();
  try {
    const support = transpileAll(exercise.testSupport);
    if (!support.ok) return failure(`Exercise helpers are broken: ${describeProblem(support.problem)}`);

    if (exercise.mode === "write-tests") return await checkWriteTests(exercise, files, support.modules, session, started);

    const subject = transpileAll(files);
    if (!subject.ok) return failure(describeProblem(subject.problem));
    const tests = transpile(exercise.testCode, TESTS_PATH);
    if (!tests.ok) return failure(`Exercise tests are broken: ${describeProblem(tests)}`);
    return await session.run({
      modules: { ...support.modules, ...subject.modules },
      testsJs: tests.js,
      testsPath: TESTS_PATH,
    });
  } catch (err) {
    return failure((err as Error).message);
  } finally {
    session.dispose();
  }
}

async function checkWriteTests(
  exercise: Exercise,
  files: WorkspaceFiles,
  support: ModuleMap,
  session: SuiteSession,
  started: number,
): Promise<TestReport> {
  const testPath = exercise.editableFiles[0];
  const learnerTests = transpile(files[testPath] ?? "", testPath);
  if (!learnerTests.ok) return failure(describeProblem(learnerTests));

  // The code under test is always the pristine starter files, never learner edits.
  const subjectSources = Object.fromEntries(
    exercise.files.filter((f) => f.path !== testPath).map((f) => [f.path, f.starter]),
  );
  const run = async (sources: Record<string, string>) => {
    const subject = transpileAll(sources);
    if (!subject.ok) throw new Error(describeProblem(subject.problem));
    return session.run({ modules: { ...support, ...subject.modules }, testsJs: learnerTests.js, testsPath: testPath });
  };

  const results: TestResult[] = [];
  const correct = await run(subjectSources);
  if (correct.error) return { ...correct, durationMs: performance.now() - started };

  const failing = correct.results.filter((r) => r.status === "fail");
  results.push({
    suite: "Your tests",
    name: "pass against the correct implementation",
    status: failing.length === 0 ? "pass" : "fail",
    message: failing.length
      ? `${failing.length} of your test(s) fail on the correct code, so they would fail on valid behaviour. ` +
        `First failure: "${failing[0].name}" — ${failing[0].message}`
      : undefined,
    durationMs: Math.round(correct.durationMs),
  });

  for (const mutant of exercise.mutants ?? []) {
    const mutated = {
      ...subjectSources,
      [mutant.file]: applyMutation(subjectSources[mutant.file] ?? "", mutant.find, mutant.replace),
    };
    const report = await run(mutated);
    const caught = report.results.some((r) => r.status === "fail");
    results.push({
      suite: "Seeded bugs",
      name: mutant.name,
      status: caught ? "pass" : "fail",
      message: caught
        ? undefined
        : `Your tests all still pass when this bug is present. ${mutant.hint ?? "Add an assertion that would notice it."}`,
      durationMs: Math.round(report.durationMs),
    });
  }
  return { results, durationMs: performance.now() - started };
}
