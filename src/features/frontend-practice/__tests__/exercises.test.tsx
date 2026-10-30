import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { EXERCISES } from "../data/registry";
import { DIFFICULTIES, TOPICS } from "../data/topics";
import { hasPreview, type Exercise } from "../data/types";
import { checkExercise, prepareRun, solutionFiles, starterFiles } from "../runner/exerciseRunner";
import { createInProcessRunner } from "../runner/inProcess";
import { createRequire } from "../runner/modules";
import { externals } from "../runner/externals";

/**
 * Verifies the question bank itself:
 *  - structure and coverage,
 *  - the starter really is broken (the tests named in `expectedFailures` fail),
 *  - the reference solution passes everything,
 *  - for write-tests exercises: the reference tests kill every mutant, and the
 *    starter does not,
 *  - every live preview renders (starter and solution) without crashing.
 */
const runner = createInProcessRunner();

describe("question bank structure", () => {
  it("has unique ids", () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every topic at every difficulty", () => {
    for (const topic of TOPICS) {
      for (const d of DIFFICULTIES) {
        const found = EXERCISES.some((e) => (e.kind ?? "debug") === "debug" && e.topic === topic.id && e.difficulty === d.id);
        expect(found, `${topic.id}/${d.id} has no exercise`).toBe(true);
      }
    }
  });

  it("has a Build section with several exercises at every difficulty", () => {
    for (const d of DIFFICULTIES) {
      const n = EXERCISES.filter((e) => e.kind === "build" && e.difficulty === d.id).length;
      expect(n, `build/${d.id}`).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(EXERCISES.filter((e) => e.kind === "build").map((e) => [e.id, e] as const))("%s (build) specifies the UI", (_id, e: Exercise) => {
    expect((e.uiSpec ?? []).length, "uiSpec needs concrete UI requirements").toBeGreaterThanOrEqual(4);
    expect(e.previewEntry, "build exercises must be previewable").toBeTruthy();
    expect(e.mode ?? "fix").toBe("fix");
    // The skeleton must be a skeleton: it should not already satisfy the requirements.
    expect(e.expectedFailures.length).toBeGreaterThan(0);
  });

  it.each(EXERCISES.map((e) => [e.id, e] as const))("%s is complete and realistic", (_id, e: Exercise) => {
    expect(e.title.length).toBeGreaterThan(5);
    expect(e.scenario.length).toBeGreaterThan(80);
    expect(e.expectedBehavior.length).toBeGreaterThan(0);
    expect(e.reproSteps.length).toBeGreaterThanOrEqual(2);
    expect(e.acceptanceCriteria.length).toBeGreaterThanOrEqual(2);
    expect(e.hints.length).toBeGreaterThanOrEqual(3);
    expect(e.explanation.rootCause.length).toBeGreaterThan(40);
    expect(e.explanation.fix.length).toBeGreaterThan(20);
    expect(e.expectedFailures.length).toBeGreaterThan(0);

    // Grounded in the real app: every referenced file must exist in the repository.
    expect(e.inspiredBy.length).toBeGreaterThan(0);
    for (const file of e.inspiredBy) {
      expect(existsSync(resolve(process.cwd(), file.replace(/^client\//, ""))), `inspiredBy ${file} not found`).toBe(true);
    }

    // Workspace wiring.
    const paths = e.files.map((f) => f.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(e.editableFiles.length).toBeGreaterThan(0);
    for (const p of e.editableFiles) expect(paths, `editable file ${p} missing`).toContain(p);
    for (const p of e.shared ?? []) expect(paths, `shared file ${p} missing`).toContain(p);
    if (e.previewEntry) expect(paths, `previewEntry ${e.previewEntry} missing`).toContain(e.previewEntry);
    expect(e.files.filter((f) => f.editable).map((f) => f.path)).toEqual(e.editableFiles);

    const editable = e.files.filter((f) => f.editable);
    expect(editable.some((f) => f.solution !== f.starter), "solution must differ from starter").toBe(true);
    expect(
      editable.some((f) => /\/\/|\/\*/.test(f.solution)),
      "solution should explain itself with comments",
    ).toBe(true);
    expect(
      editable.some((f) => /\/\/|\/\*/.test(f.starter)),
      "starter should have context comments",
    ).toBe(true);

    if (e.mode === "write-tests") {
      expect((e.mutants ?? []).length).toBeGreaterThanOrEqual(3);
      expect(e.testCode).toBe("");
    } else {
      expect(e.testCode.length).toBeGreaterThan(0);
    }
  });
});

describe.each(EXERCISES.map((e) => [e.id, e] as const))("exercise %s", (_id, e: Exercise) => {
  it("starter code fails the intended tests", async () => {
    const report = await checkExercise(e, starterFiles(e), runner);
    expect(report.error, "starter must load and run").toBeUndefined();
    const failed = report.results.filter((r) => r.status === "fail");
    expect(failed.length, "starter should not pass everything").toBeGreaterThan(0);
    for (const needle of e.expectedFailures) {
      const hit = failed.some((r) => `${r.suite} ${r.name}`.toLowerCase().includes(needle.toLowerCase()));
      expect(hit, `expected a failing test matching "${needle}"; failing: ${failed.map((r) => r.name).join(" | ")}`).toBe(true);
    }
  });

  it("reference solution passes every test", async () => {
    const report = await checkExercise(e, solutionFiles(e), runner);
    expect(report.error).toBeUndefined();
    expect(report.results.length).toBeGreaterThanOrEqual(e.mode === "write-tests" ? 4 : 3);
    const failed = report.results.filter((r) => r.status === "fail");
    expect(failed.map((r) => `${r.name}: ${r.message}`)).toEqual([]);
  });
});

describe("live previews render", () => {
  afterEach(cleanup);

  it.each(EXERCISES.filter(hasPreview).flatMap((e) => [[e.id, "starter", e] as const, [e.id, "solution", e] as const]))(
    "%s (%s) renders its demo without crashing",
    async (_id, which, e: Exercise) => {
      const prepared = prepareRun(e, which === "starter" ? starterFiles(e) : solutionFiles(e));
      expect(prepared.ok).toBe(true);
      if (!prepared.ok) return;
      const { modules: transpiled } = prepared;
      const { load } = createRequire(transpiled, externals);
      const Demo = load(e.previewEntry!).default as () => null;
      expect(typeof Demo, "preview entry needs a default export component").toBe("function");
      await act(async () => {
        render(createElement(MemoryRouter, null, createElement(Demo)));
      });
      expect(document.body.textContent?.length).toBeGreaterThan(0);
    },
  );
});
