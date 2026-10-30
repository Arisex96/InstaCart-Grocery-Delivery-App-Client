// @vitest-environment node
import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { buildSrcDoc, SANDBOX_ATTRIBUTE } from "../runner/sandbox";
import { transpile, transpileAll } from "../runner/transpile";

/**
 * Loads the real, built runtime bundle (the exact script the browser puts in
 * the sandbox iframe) into a standalone jsdom window and talks to it through
 * the same postMessage protocol the app uses.
 */
function boot() {
  const dom = new JSDOM(buildSrcDoc({ styled: false }), {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    // react-router touches TextEncoder at load; every real browser has it, jsdom does not.
    beforeParse(w) {
      Object.assign(w, { TextEncoder, TextDecoder });
    },
  });
  const { window } = dom;
  const messages: { type: string; [key: string]: unknown }[] = [];
  window.addEventListener("message", (e: Event) => messages.push((e as MessageEvent).data));
  const send = (data: unknown) =>
    // In a standalone window `parent === window`, which is what the entry script checks.
    window.dispatchEvent(new window.MessageEvent("message", { data, source: window as never }));
  const waitFor = async (type: string, predicate: (m: Record<string, unknown>) => boolean = () => true) => {
    for (let i = 0; i < 200; i++) {
      const hit = messages.find((m) => m.type === type && predicate(m));
      if (hit) return hit;
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error(`no ${type} message; got ${JSON.stringify(messages.map((m) => m.type))}`);
  };
  return { dom, window, send, waitFor, messages };
}

const files = (sources: Record<string, string>) => {
  const r = transpileAll(sources);
  if (!r.ok) throw new Error(r.problem.message);
  return r.modules;
};

const js = (src: string) => {
  const r = transpile(src, "x.jsx");
  if (!r.ok) throw new Error(r.message);
  return r.js;
};

describe("sandbox document", () => {
  it("is isolated: no same-origin, no popups/top-navigation, no network via CSP", () => {
    expect(SANDBOX_ATTRIBUTE.split(" ").sort()).toEqual(["allow-forms", "allow-scripts"]);
    expect(SANDBOX_ATTRIBUTE).not.toContain("allow-same-origin");
    const doc = buildSrcDoc();
    expect(doc).toContain("default-src 'none'");
    expect(doc).not.toMatch(/connect-src/);
  });

  it("only the real closing tags appear: one for the test runner, two (Tailwind + runtime) for the preview", () => {
    expect(buildSrcDoc({ styled: false }).match(/<\/script/gi)).toHaveLength(1);
    expect(buildSrcDoc({ styled: true }).match(/<\/script/gi)).toHaveLength(2);
  });

  it("styles the preview with Tailwind and the InstaCart theme tokens, test frames stay lean", () => {
    expect(buildSrcDoc({ styled: true })).toContain("--color-app-green");
    expect(buildSrcDoc({ styled: false })).not.toContain("--color-app-green");
  });
});

describe("sandbox runtime bundle", () => {
  it("redirects unprevented form submits to a sink frame and warns, without touching defaultPrevented", async () => {
    const { waitFor, window } = boot();
    await waitFor("ready");
    const doc = window.document;
    expect(doc.querySelector("iframe[name=__form_sink__]")?.getAttribute("sandbox")).toBe("");
    const form = doc.createElement("form");
    doc.body.appendChild(form);
    const plain = new window.Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(plain);
    expect(form.target).toBe("__form_sink__");
    expect(plain.defaultPrevented).toBe(false);
    await waitFor("console", (m) => m.level === "warn" && String(m.text).includes("without event.preventDefault()"));
    window.close();
  });

  it("announces itself and runs a multi-file test suite via postMessage", async () => {
    const { send, waitFor, window } = boot();
    await waitFor("ready");
    send({
      type: "run-tests",
      id: 7,
      testsPath: "tests.jsx",
      modules: files({
        "src/math.js": "export const double = (n) => n * 2;",
        "src/index.js": `import { double } from "./math"; export const quad = (n) => double(double(n));`,
      }),
      testsJs: js(`import { quad } from "./src";
        it("quadruples", () => expect(quad(2)).toBe(8));
        it("fails", () => expect(quad(2)).toBe(5));`),
    });
    const result = (await waitFor("tests-result")) as unknown as { id: number; report: { results: { status: string }[] } };
    expect(result.id).toBe(7);
    expect(result.report.results.map((r) => r.status)).toEqual(["pass", "fail"]);
    window.close();
  });

  it("forwards console output from a test run, tagged as coming from the tests", async () => {
    const { send, waitFor, window } = boot();
    await waitFor("ready");
    send({
      type: "run-tests",
      id: 1,
      testsPath: "tests.jsx",
      modules: files({ "src/a.js": `console.log("module loaded", { n: 1 });` }),
      testsJs: js(`import "./src/a"; it("logs", () => { console.warn("careful"); console.error("bad", new Error("x").message); });`),
    });
    await waitFor("tests-result");
    const logs = await waitFor("console", (m) => m.level === "log");
    expect(logs).toMatchObject({ level: "log", text: "module loaded { n: 1 }", source: "tests" });
    await waitFor("console", (m) => m.level === "warn" && m.text === "careful");
    await waitFor("console", (m) => m.level === "error" && m.text === "bad x");
    window.close();
  });

  it("renders a multi-file preview inside a router with the app's packages", async () => {
    const { send, waitFor, window } = boot();
    await waitFor("ready");
    send({
      type: "preview",
      token: 1,
      ui: true,
      entry: "src/Demo.jsx",
      modules: files({
        "src/components/Badge.jsx": `import { Plus } from "lucide-react"; export default ({ children }) => <span><Plus size={4} />{children}</span>;`,
        "src/Demo.jsx": `import { Link } from "react-router-dom"; import Badge from "./components/Badge";
          export default function Demo() { return <h1><Badge>Fresh bananas</Badge><Link to="/x">go</Link></h1>; }`,
      }),
    });
    const status = (await waitFor("preview-status")) as unknown as { ok: boolean; token: number };
    expect(status).toMatchObject({ ok: true, token: 1 });
    await new Promise((r) => setTimeout(r, 50));
    expect(window.document.getElementById("root")?.textContent).toBe("Fresh bananasgo");
    window.close();
  });

  it("captures console output of the previewed code", async () => {
    const { send, waitFor, window } = boot();
    await waitFor("ready");
    send({
      type: "preview",
      token: 1,
      ui: false,
      entry: "src/calc.js",
      modules: files({ "src/calc.js": `console.log("total", 1 + 2); console.warn("low stock"); console.error("oops");` }),
    });
    await waitFor("console", (m) => m.level === "log" && m.text === "total 3");
    await waitFor("console", (m) => m.level === "warn" && m.text === "low stock");
    await waitFor("console", (m) => m.level === "error" && m.text === "oops");
    expect(await waitFor("preview-status")).toMatchObject({ ok: true });
    window.close();
  });

  it("reports a preview that has no default export", async () => {
    const { send, waitFor, window } = boot();
    await waitFor("ready");
    send({ type: "preview", token: 1, ui: true, entry: "src/x.jsx", modules: files({ "src/x.jsx": "export const x = 1;" }) });
    const status = (await waitFor("preview-status")) as unknown as { ok: boolean; error: string };
    expect(status.ok).toBe(false);
    expect(status.error).toMatch(/default export/);
    window.close();
  });

  it("reports runtime errors with a stack that points at the learner's line", async () => {
    const { send, waitFor, window } = boot();
    await waitFor("ready");
    send({
      type: "preview",
      token: 2,
      ui: false,
      entry: "src/x.jsx",
      modules: files({ "src/x.jsx": "// line 1\n// line 2\nthrow new Error('boom on line 3');\n" }),
    });
    const status = (await waitFor("preview-status", (m) => m.ok === false)) as unknown as {
      error: string;
      stack: string;
      token: number;
    };
    expect(status.token).toBe(2);
    expect(status.error).toMatch(/boom on line 3/);
    expect(status.stack).toMatch(/src\/x\.jsx:3:/);
    const logged = (await waitFor("console", (m) => m.level === "error")) as unknown as { text: string };
    expect(logged.text).toMatch(/boom on line 3/);
    window.close();
  });

  it("catches render errors with an error boundary instead of blanking the preview", async () => {
    const { send, waitFor, window } = boot();
    await waitFor("ready");
    send({
      type: "preview",
      token: 3,
      ui: true,
      entry: "src/Demo.jsx",
      modules: files({ "src/Demo.jsx": `export default function Demo() { const p = null; return <p>{p.name}</p>; }` }),
    });
    const status = (await waitFor("preview-status", (m) => m.ok === false)) as unknown as { error: string };
    expect(status.error).toMatch(/TypeError/);
    window.close();
  });

  it("ignores messages that do not come from the parent window", async () => {
    const { dom, waitFor, messages, window } = boot();
    await waitFor("ready");
    const other = new JSDOM("").window;
    window.dispatchEvent(
      new window.MessageEvent("message", {
        data: { type: "preview", token: 1, ui: false, entry: "a.js", modules: { "a.js": "throw 1" } },
        source: other as never,
      }),
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(messages.some((m) => m.type === "preview-status")).toBe(false);
    dom.window.close();
  });
});
