import { describe, expect, it } from "vitest";
import { expect as lab, fn } from "../runner/expect";
import { runTestSuite } from "../runner/engine";
import { transpile, transpileAll } from "../runner/transpile";
import { cleanup, externals } from "../runner/externals";
import { fixStack, normalizePath, resolveRelative } from "../runner/modules";
import { formatArg, formatArgs } from "../runner/console";

const env = { externals, cleanup, perTestTimeoutMs: 300 };

/** Runs `tests` (tests.jsx) against a workspace of source files. */
async function run(files: Record<string, string> | string, tests: string) {
  const sources = typeof files === "string" ? { "solution.jsx": files } : files;
  const compiled = transpileAll(sources);
  const t = transpile(tests, "tests.jsx");
  if (!compiled.ok || !t.ok) throw new Error("transpile failed");
  return runTestSuite({ modules: compiled.modules, testsJs: t.js, testsPath: "tests.jsx" }, env);
}

describe("assertion library", () => {
  it("compares values like Jest", () => {
    expect(() => lab(1).toBe(1)).not.toThrow();
    expect(() => lab(1).toBe(2)).toThrow(/Expected 2/);
    expect(() => lab({ a: [1, { b: 2 }] }).toEqual({ a: [1, { b: 2 }] })).not.toThrow();
    expect(() => lab({ a: 1 }).toEqual({ a: 2 })).toThrow();
    expect(() => lab(0.1 + 0.2).toBe(0.3)).toThrow();
    expect(() => lab(0.1 + 0.2).toBeCloseTo(0.3)).not.toThrow();
    expect(() => lab([1, 2]).not.toContain(3)).not.toThrow();
    expect(() => lab("abc").not.toMatch(/z/)).not.toThrow();
  });

  it("supports mock functions", () => {
    const f = fn();
    f(1, "a");
    expect(() => lab(f).toHaveBeenCalledTimes(1)).not.toThrow();
    expect(() => lab(f).toHaveBeenCalledWith(1, "a")).not.toThrow();
    expect(() => lab(f).toHaveBeenCalledTimes(2)).toThrow(/Received 1/);
    expect(() => lab(() => 1).toHaveBeenCalled()).toThrow(/mock function/);
  });

  it("supports promises and thrown errors", async () => {
    await lab(Promise.resolve(3)).resolves.toBe(3);
    await lab(Promise.reject(new Error("nope"))).rejects.toHaveProperty("message", "nope");
    expect(() =>
      lab(() => {
        throw new Error("boom");
      }).toThrow("boom"),
    ).not.toThrow();
  });

  it("asserts on DOM elements with helpful errors", () => {
    document.body.innerHTML = '<button disabled>Go</button><input value="x" />';
    const button = document.querySelector("button");
    lab(button).toBeDisabled();
    lab(button).toHaveTextContent("Go");
    lab(document.querySelector("input")).toHaveValue("x");
    expect(() => lab(null).toBeDisabled()).toThrow(/expects a DOM element/);
    lab(null).not.toBeInTheDocument();
  });
});

describe("module resolution", () => {
  const files = { "src/a.js": "", "src/lib/index.js": "", "src/lib/b.jsx": "" };

  it("normalizes paths", () => {
    expect(normalizePath("src/./lib/../a.js")).toBe("src/a.js");
  });

  it("resolves relative specifiers with extensions and index files", () => {
    expect(resolveRelative("src/components/Card.jsx", "../a", files)).toBe("src/a.js");
    expect(resolveRelative("src/a.js", "./lib", files)).toBe("src/lib/index.js");
    expect(resolveRelative("src/a.js", "./lib/b", files)).toBe("src/lib/b.jsx");
    expect(resolveRelative("src/a.js", "./missing", files)).toBeUndefined();
  });

  it("rewrites stack positions to the learner's lines", () => {
    const stack = "Error: x\n    at fn (src/a.js:12:5)\n    at other (node_modules/react.js:99:1)";
    expect(fixStack(stack, { "src/a.js": "" })).toBe(
      "Error: x\n    at fn (src/a.js:10:5)\n    at other (node_modules/react.js:99:1)",
    );
  });
});

describe("console formatting", () => {
  it("formats values like a devtools console", () => {
    expect(formatArgs(["hello", 1, { a: [1, "x"] }, null, undefined])).toBe('hello 1 { a: [1, "x"] } null undefined');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(formatArg(circular)).toContain("[Circular]");
    expect(formatArg(new Error("boom"))).toContain("boom");
    expect(formatArg(function named() {})).toBe("ƒ named()");
  });
});

describe("test engine", () => {
  it("reports pass and fail with messages", async () => {
    const report = await run(
      "export const add = (a, b) => a + b;",
      `import { add } from "./solution";
       describe("add", () => {
         it("adds", () => expect(add(1, 2)).toBe(3));
         it("is wrong on purpose", () => expect(add(1, 2)).toBe(4));
       });`,
    );
    expect(report.error).toBeUndefined();
    expect(report.results.map((r) => [r.name, r.status])).toEqual([
      ["adds", "pass"],
      ["is wrong on purpose", "fail"],
    ]);
    expect(report.results[1].message).toContain("Expected 4");
    expect(report.results[0].suite).toBe("add");
  });

  it("runs multi-file workspaces: imports between learner files resolve like in the app", async () => {
    const report = await run(
      {
        "src/store/cart.js": "export const price = (p) => p.cents / 100;",
        "src/components/Total.jsx": `import { price } from "../store/cart"; export default function Total({ p }) { return <b>{price(p)}</b>; }`,
      },
      `import { render, screen } from "@testing-library/react";
       import Total from "./src/components/Total";
       it("renders through the store module", () => {
         render(<Total p={{ cents: 250 }} />);
         expect(screen.getByText("2.5")).toBeInTheDocument();
       });`,
    );
    expect(report.error).toBeUndefined();
    expect(report.results[0].status).toBe("pass");
  });

  it("reports a missing relative import with the importing file", async () => {
    const report = await run({ "src/a.js": `import x from "./nope"; export default x;` }, `import "./src/a"; it("x", () => {});`);
    expect(report.error).toMatch(/Cannot find module '\.\/nope' imported from src\/a\.js/);
  });

  it("reports syntax errors in transpilation with a position", () => {
    const result = transpile("const a = 1;\nexport const x = ;", "src/solution.jsx");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.path).toBe("src/solution.jsx");
      expect(result.line).toBe(2);
      expect(result.message).toMatch(/Unexpected token/);
    }
  });

  it("reports runtime errors while loading a learner file, naming the file", async () => {
    const report = await run("throw new Error('kaboom');", `import "./solution"; it("x", () => {});`);
    expect(report.error).toMatch(/solution\.jsx failed to load: Error: kaboom/);
  });

  it("loads learner files the tests never import so their errors are not hidden", async () => {
    const report = await run({ "src/unused.js": "throw new Error('hidden');" }, `it("x", () => {});`);
    expect(report.error).toMatch(/src\/unused\.js failed to load/);
  });

  it("reports missing exports as failing tests, not crashes", async () => {
    const report = await run(
      "export const a = 1;",
      `import { missing } from "./solution"; it("uses it", () => missing());`,
    );
    expect(report.results[0].status).toBe("fail");
    expect(report.results[0].message).toMatch(/solution\.jsx does not export 'missing'/);
  });

  it("times out tests that never settle", async () => {
    const report = await run("export const a = 1;", `it("hangs", () => new Promise(() => {}));`);
    expect(report.results[0].status).toBe("fail");
    expect(report.results[0].message).toMatch(/Timed out/);
  });

  it("captures console.error per test and restores it", async () => {
    const original = console.error;
    const report = await run(
      "export const a = 1;",
      `it("sees errors", () => { console.error("warned"); expect(consoleErrors()).toEqual(["warned"]); });
       it("starts clean", () => expect(consoleErrors()).toHaveLength(0));`,
    );
    expect(report.results.map((r) => r.status)).toEqual(["pass", "pass"]);
    expect(console.error).toBe(original);
  });

  it("runs hooks in order and renders React components", async () => {
    const report = await run(
      `export function Hello({ name }) { return <p>Hello {name}</p>; }`,
      `import { render, screen } from "@testing-library/react";
       import { Hello } from "./solution";
       const order = [];
       beforeEach(() => order.push("before"));
       afterEach(() => order.push("after"));
       it("renders", () => {
         render(<Hello name="Ana" />);
         expect(screen.getByText("Hello Ana")).toBeInTheDocument();
         expect(order).toEqual(["before"]);
       });
       it("cleans up between tests", () => {
         expect(screen.queryByText("Hello Ana")).not.toBeInTheDocument();
         expect(order).toEqual(["before", "after", "before"]);
       });`,
    );
    expect(report.results.map((r) => r.status)).toEqual(["pass", "pass"]);
  });

  it("provides the app's packages (zustand, react-router-dom, lucide-react, react-hot-toast)", async () => {
    const report = await run(
      `import { create } from "zustand";
       import { Plus } from "lucide-react";
       import toast from "react-hot-toast";
       import { MemoryRouter, useNavigate } from "react-router-dom";
       export const useStore = create((set) => ({ n: 0, inc: () => set((s) => ({ n: s.n + 1 })) }));
       export const icons = { Plus, toast, MemoryRouter, useNavigate };`,
      `import { useStore, icons } from "./solution";
       it("has them", () => {
         useStore.getState().inc();
         expect(useStore.getState().n).toBe(1);
         expect(typeof icons.toast.success).toBe("function");
         expect(typeof icons.useNavigate).toBe("function");
       });`,
    );
    expect(report.error).toBeUndefined();
    expect(report.results[0].status).toBe("pass");
  });

  it("rejects imports that are not provided (no network packages like axios)", async () => {
    const report = await run("export const a = 1;", `import axios from "axios"; it("x", () => {});`);
    expect(report.error).toMatch(/Cannot find module 'axios'/);
  });
});
