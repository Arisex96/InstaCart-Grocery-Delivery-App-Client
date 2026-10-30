/**
 * Minimal test engine (describe / it / hooks) used by the practice lab.
 *
 * It is environment-agnostic: the sandbox iframe and the vitest suite that
 * verifies every exercise both call `runTestSuite` with the same arguments, so
 * "the exercise works in vitest" really means "it works in the lab".
 */
import { AssertionError, expect, fn } from "./expect";
import { createRequire, evaluateModule, LoadError, type ModuleMap } from "./modules";

export type TestStatus = "pass" | "fail";

export interface TestResult {
  suite: string;
  name: string;
  status: TestStatus;
  message?: string;
  durationMs: number;
}

export interface TestReport {
  results: TestResult[];
  /** Set when the code or tests could not be loaded at all. */
  error?: string;
  /** Stack of the load error, when the browser provided one. */
  errorStack?: string;
  durationMs: number;
}

export interface SuiteRequest {
  /** Learner-visible + support files, already transpiled to CommonJS, by path. */
  modules: ModuleMap;
  /** CommonJS source of the test file. */
  testsJs: string;
  /** Path of the test file (relative imports in it resolve from here). */
  testsPath: string;
}

export interface SuiteEnvironment {
  /** Bare-specifier modules available to both learner code and tests. */
  externals: Record<string, unknown>;
  /** Called after every test (e.g. Testing Library's `cleanup`). */
  cleanup?: () => void;
  perTestTimeoutMs?: number;
  /** Also forward console.error to the previous console (the sandbox captures it). */
  passThroughConsole?: boolean;
}

type Hook = () => unknown | Promise<unknown>;
interface Scope {
  name: string;
  parent: Scope | null;
  before: Hook[];
  after: Hook[];
}
interface Collected {
  scope: Scope;
  name: string;
  run: Hook;
}

const withTimeout = <T,>(p: Promise<T>, ms: number, what: string) =>
  new Promise<T>((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`Timed out after ${ms}ms while ${what}. Is a promise never resolving, or a loop never ending?`)),
      ms,
    );
    p.then(
      (v) => (clearTimeout(t), resolve(v)),
      (e) => (clearTimeout(t), reject(e)),
    );
  });

export async function runTestSuite(request: SuiteRequest, env: SuiteEnvironment): Promise<TestReport> {
  const started = performance.now();
  const timeout = env.perTestTimeoutMs ?? 4000;
  const tests: Collected[] = [];
  const root: Scope = { name: "", parent: null, before: [], after: [] };
  let current = root;

  const describe = (name: string, body: () => void) => {
    const scope: Scope = { name, parent: current, before: [], after: [] };
    const previous = current;
    current = scope;
    try {
      body();
    } finally {
      current = previous;
    }
  };
  const it = (name: string, run: Hook) => {
    tests.push({ scope: current, name, run });
  };

  let errors: string[] = [];
  const consoleErrors = () => errors;
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const files: ModuleMap = { ...request.modules, [request.testsPath]: request.testsJs };
  const { requireFrom, load } = createRequire(files, env.externals);
  const globals = {
    describe,
    it,
    test: it,
    expect,
    beforeEach: (h: Hook) => current.before.push(h),
    afterEach: (h: Hook) => current.after.push(h),
    fn,
    consoleErrors,
    sleep,
  };

  try {
    evaluateModule(request.testsPath, request.testsJs, requireFrom(request.testsPath), globals);
    // Load every learner file even when the tests never import it, so syntax
    // and top-level errors in it are reported instead of silently ignored.
    for (const path of Object.keys(request.modules)) load(path);
  } catch (err) {
    const e = err as Error;
    return {
      results: [],
      error: e instanceof LoadError ? e.message : `Failed to load: ${e.message}`,
      errorStack: e.stack,
      durationMs: performance.now() - started,
    };
  }

  const chain = (scope: Scope) => {
    const out: Scope[] = [];
    for (let s: Scope | null = scope; s; s = s.parent) out.unshift(s);
    return out;
  };

  const results: TestResult[] = [];
  const originalError = console.error;
  for (const t of tests) {
    const begin = performance.now();
    const scopes = chain(t.scope);
    errors = [];
    console.error = (...args: unknown[]) => {
      errors.push(args.map((a) => (typeof a === "string" ? a : String(a))).join(" "));
      if (env.passThroughConsole) originalError.apply(console, args);
    };
    let message: string | undefined;
    try {
      for (const s of scopes) for (const h of s.before) await withTimeout(Promise.resolve(h()), timeout, "running beforeEach");
      await withTimeout(Promise.resolve(t.run()), timeout, "running the test");
    } catch (err) {
      const e = err as Error;
      message = e instanceof AssertionError ? e.message : `${e?.name ?? "Error"}: ${e?.message ?? String(err)}`;
    } finally {
      console.error = originalError;
      try {
        for (const s of [...scopes].reverse()) for (const h of s.after) await h();
        env.cleanup?.();
      } catch (err) {
        message ??= `Cleanup failed: ${(err as Error).message}`;
      }
    }
    results.push({
      suite: scopes
        .map((s) => s.name)
        .filter(Boolean)
        .join(" › "),
      name: t.name,
      status: message === undefined ? "pass" : "fail",
      message,
      durationMs: Math.round(performance.now() - begin),
    });
  }

  if (results.length === 0) {
    return { results, error: "The test file did not register any tests.", durationMs: performance.now() - started };
  }
  return { results, durationMs: performance.now() - started };
}
