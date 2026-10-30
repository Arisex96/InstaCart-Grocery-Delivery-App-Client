import { runTestSuite } from "./engine";
import { cleanup, externals } from "./externals";
import type { SuiteRunner } from "./exerciseRunner";

/**
 * Runs suites in the current JS realm. Used by vitest to verify exercises and
 * to exercise the UI without real iframes. Never used for learner code in the
 * browser (that goes through the sandbox).
 * Pass `cleanup: false` when the host test itself uses Testing Library, because
 * its cleanup would unmount the host render too.
 */
export function createInProcessRunner({ cleanup: doCleanup = true } = {}): SuiteRunner {
  return {
    createSession: () => ({
      run: (request) =>
        runTestSuite(request, { externals, cleanup: doCleanup ? cleanup : undefined, perTestTimeoutMs: 3000 }),
      dispose: () => undefined,
    }),
  };
}

export const inProcessRunner = createInProcessRunner();
