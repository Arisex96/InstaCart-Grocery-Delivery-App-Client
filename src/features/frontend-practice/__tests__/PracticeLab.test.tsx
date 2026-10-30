import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorView } from "@codemirror/view";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import PracticeLab from "../PracticeLab";
import { createInProcessRunner } from "../runner/inProcess";
import type { Exercise } from "../data/types";
import { EXERCISES } from "../data/registry";

// The host test uses Testing Library too; the runner must not unmount its tree.
const inProcessRunner = createInProcessRunner({ cleanup: false });

const BUGGY = "export const add = (a, b) => a - b; // intentionally wrong\n";
const FIXED = "export const add = (a, b) => a + b; // the fix\n";
const UNIT = "export const unit = 'kg';\n";
const GREETING = "export default function Greeting() { return <p>Hello shopper</p>; }\n";
const DEMO = 'import Greeting from "./Greeting";\nexport default function Demo() { return <Greeting />; }\n';

const make = (over: Partial<Exercise>): Exercise => ({
  id: "x",
  title: "X",
  topic: "components",
  difficulty: "easy",
  summary: "s",
  scenario: "A realistic scenario paragraph.",
  inspiredBy: ["client/src/components/ProductCard.tsx"],
  editableFiles: ["src/math.js"],
  expectedBehavior: ["add(1, 2) is 3"],
  reproSteps: ["Call add(1, 2)", "Observe -1"],
  acceptanceCriteria: ["Returns the sum"],
  hints: ["First hint text", "Second hint text"],
  explanation: { rootCause: "Used minus instead of plus.", fix: "Use plus.", takeaways: ["Read operators"] },
  expectedFailures: ["adds"],
  files: [
    { path: "src/math.js", starter: BUGGY, solution: FIXED, editable: true },
    { path: "src/unit.js", starter: UNIT, solution: UNIT, editable: false },
  ],
  testCode: `import { add } from "./src/math";
    it("adds two numbers", () => expect(add(1, 2)).toBe(3));`,
  testSupport: {},
  ...over,
});

const SET: Exercise[] = [
  make({ id: "add", title: "Add numbers" }),
  make({
    id: "greet",
    title: "Greeting card",
    topic: "state-updates",
    difficulty: "medium",
    previewEntry: "src/Demo.jsx",
    editableFiles: ["src/Greeting.jsx"],
    files: [
      { path: "src/Greeting.jsx", starter: GREETING, solution: GREETING + "// solved\n", editable: true },
      { path: "src/Demo.jsx", starter: DEMO, solution: DEMO, editable: false },
    ],
    testCode: `import Greeting from "./src/Greeting"; it("greets", () => expect(typeof Greeting).toBe("function"));`,
  }),
  make({ id: "lists-hard", title: "Hard list puzzle", topic: "lists", difficulty: "hard" }),
];

function Where() {
  return <span data-testid="where">{useLocation().pathname}</span>;
}

function renderLab(start = "/practice/add", exercises = SET) {
  return render(
    <MemoryRouter initialEntries={[start]}>
      <Where />
      <Routes>
        <Route path="/practice" element={<PracticeLab exercises={exercises} runner={inProcessRunner} />} />
        <Route path="/practice/:id" element={<PracticeLab exercises={exercises} runner={inProcessRunner} />} />
      </Routes>
    </MemoryRouter>,
  );
}

// ---- CodeMirror helpers: the editor is a contenteditable, so drive its state API ----
const editorContent = (path: string) => screen.getByLabelText(`Code editor: ${path}`);
const viewOf = (path: string) => EditorView.findFromDOM(editorContent(path).closest(".cm-editor") as HTMLElement)!;
const valueOf = (path: string) => viewOf(path).state.doc.toString();
const typeInto = (path: string, text: string) =>
  act(() => {
    const view = viewOf(path);
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
  });
const openFile = (name: string) => userEvent.click(screen.getByRole("tab", { name: new RegExp(name) }));
const runTests = () => userEvent.click(screen.getByRole("button", { name: /run tests/i }));
const run = () => userEvent.click(screen.getByRole("button", { name: /^Run$/ }));

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("workspace", () => {
  it("shows the problem, acceptance criteria and the real starter code in a code editor", () => {
    renderLab();
    expect(screen.getByRole("heading", { name: "Add numbers", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("A realistic scenario paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Returns the sum")).toBeInTheDocument();
    expect(screen.getByText("Observe -1")).toBeInTheDocument();
    expect(screen.getByText(/Modelled on: src\/components\/ProductCard\.tsx/)).toBeInTheDocument();
    expect(valueOf("src/math.js")).toBe(BUGGY);
  });

  it("uses CodeMirror: syntax-highlighted lines and line numbers", () => {
    renderLab();
    const root = editorContent("src/math.js").closest(".cm-editor") as HTMLElement;
    expect(root.querySelector(".cm-lineNumbers")).not.toBeNull();
    expect(root.querySelectorAll(".cm-line").length).toBeGreaterThan(0);
    // The JavaScript language is active (tokens are wrapped in highlight spans).
    expect(root.querySelector(".cm-line span")).not.toBeNull();
  });

  it("falls back to the first question for an unknown id", () => {
    renderLab("/practice/nope");
    expect(screen.getByRole("heading", { name: "Add numbers", level: 2 })).toBeInTheDocument();
  });

  it("lists every file as a tab and marks context files read-only", async () => {
    renderLab();
    expect(screen.getByRole("tab", { name: /math\.js/ })).toBeInTheDocument();
    await openFile("unit.js");
    expect(screen.getByText(/read-only context/)).toBeInTheDocument();
    expect(viewOf("src/unit.js").state.readOnly).toBe(true);
    expect(valueOf("src/unit.js")).toBe(UNIT);
  });

  it("keeps edits per file when switching file tabs", async () => {
    renderLab("/practice/greet");
    await typeInto("src/Greeting.jsx", "export default () => <p>edited</p>;");
    await openFile("Demo.jsx");
    expect(valueOf("src/Demo.jsx")).toBe(DEMO);
    await openFile("Greeting.jsx");
    expect(valueOf("src/Greeting.jsx")).toBe("export default () => <p>edited</p>;");
  });
});

describe("filters and navigation", () => {
  const nav = () => screen.getAllByRole("navigation", { name: "Questions", hidden: true })[0];

  it("filters by topic and difficulty", async () => {
    renderLab();
    await userEvent.selectOptions(within(nav()).getByLabelText("Topic"), "lists");
    expect(within(nav()).getByText("Hard list puzzle")).toBeInTheDocument();
    expect(within(nav()).queryByText("Add numbers")).not.toBeInTheDocument();
    expect(within(nav()).getByText("1 question")).toBeInTheDocument();

    await userEvent.selectOptions(within(nav()).getByLabelText("Topic"), "all");
    await userEvent.click(within(nav()).getByRole("button", { name: "Medium", hidden: true }));
    expect(within(nav()).getByText("Greeting card")).toBeInTheDocument();
    expect(within(nav()).queryByText("Add numbers")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderLab();
    await userEvent.selectOptions(within(nav()).getByLabelText("Topic"), "forms");
    expect(within(nav()).getByText(/No questions match/)).toBeInTheDocument();
  });

  it("navigates with next / previous and by selecting from the list", async () => {
    renderLab();
    // The workspace remounts per question, so re-query the buttons each time.
    const prev = () => screen.getByRole("button", { name: "Previous question" });
    const next = () => screen.getByRole("button", { name: "Next question" });
    expect(prev()).toBeDisabled();

    await userEvent.click(next());
    expect(screen.getByTestId("where")).toHaveTextContent("/practice/greet");
    await userEvent.click(next());
    expect(screen.getByTestId("where")).toHaveTextContent("/practice/lists-hard");
    expect(next()).toBeDisabled();
    await userEvent.click(prev());
    expect(screen.getByTestId("where")).toHaveTextContent("/practice/greet");

    await userEvent.click(within(nav()).getByRole("button", { name: /Add numbers/, hidden: true }));
    expect(screen.getByTestId("where")).toHaveTextContent("/practice/add");
  });

  it("does not lose edits when navigating away and back, or after a reload", async () => {
    const first = renderLab();
    await typeInto("src/math.js", "export const add = () => 42;");
    await userEvent.click(screen.getByRole("button", { name: "Next question" }));
    expect(valueOf("src/Greeting.jsx")).toBe(GREETING);
    await userEvent.click(screen.getByRole("button", { name: "Previous question" }));
    expect(valueOf("src/math.js")).toBe("export const add = () => 42;");

    first.unmount();
    renderLab();
    expect(valueOf("src/math.js")).toBe("export const add = () => 42;");
  });
});

describe("running tests", () => {
  it("runs the tests against the learner's code and shows real failures with messages", async () => {
    renderLab();
    await runTests();
    const results = await screen.findByTestId("results");
    expect(results).toHaveTextContent("0 of 1 tests passed");
    expect(results).toHaveTextContent("adds two numbers");
    expect(results).toHaveTextContent("Expected 3");
    expect(results).toHaveTextContent("Received -1");
    expect(screen.getByRole("tab", { name: /Tests/ })).toHaveTextContent("0/1");
  });

  it("passes after the fix and marks the exercise solved", async () => {
    renderLab();
    await typeInto("src/math.js", FIXED);
    await runTests();
    await waitFor(() => expect(screen.getByTestId("results")).toHaveTextContent("All 1 tests passed"));
    expect(screen.getByTestId("progress")).toHaveTextContent("1 / 3 solved");
  });

  it("reports syntax errors with file and position instead of crashing", async () => {
    renderLab();
    await typeInto("src/math.js", "export const add = (a, b) => {");
    await runTests();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Syntax error in src\/math\.js \(line 1/);
    expect(screen.getByTestId("progress")).toHaveTextContent("0 / 3 solved");
  });

  it("reports runtime errors thrown while loading the code, naming the file", async () => {
    renderLab();
    await typeInto("src/math.js", "throw new Error('boom');");
    await runTests();
    expect(await screen.findByRole("alert")).toHaveTextContent("src/math.js failed to load: Error: boom");
  });

  it("keeps results per question", async () => {
    renderLab();
    await runTests();
    await screen.findByTestId("results");
    await userEvent.click(screen.getByRole("button", { name: "Next question" }));
    expect(screen.queryByTestId("results")).not.toBeInTheDocument();
  });
});

describe("compile diagnostics", () => {
  it("shows a clean status, then flags a syntax error with position in the status line and the tab", async () => {
    renderLab();
    expect(screen.getByText("No syntax errors")).toBeInTheDocument();

    await typeInto("src/math.js", "const a = 1;\nexport const add = (;");
    expect(await screen.findByTestId("diagnostics")).toHaveTextContent(/src\/math\.js:2:\d+ Unexpected token/);
    expect(screen.getByLabelText("has errors")).toBeInTheDocument();

    await typeInto("src/math.js", FIXED);
    await waitFor(() => expect(screen.getByText("No syntax errors")).toBeInTheDocument());
  });

  it("underlines the error inside the editor (lint gutter)", async () => {
    renderLab();
    await typeInto("src/math.js", "export const add = (;");
    await waitFor(() => expect(document.querySelector(".cm-lint-marker, .cm-lintRange")).not.toBeNull());
  });
});

describe("attempted vs solved tracking", () => {
  const nav = () => screen.getAllByRole("navigation", { name: "Questions", hidden: true })[0];
  const marker = (title: RegExp) =>
    within(within(nav()).getByRole("button", { name: title, hidden: true })).getByLabelText(/Solved|Attempted|Not started/);

  it("starts as not started, becomes attempted when edited, solved only when tests pass", async () => {
    renderLab();
    expect(marker(/Add numbers/)).toHaveAttribute("aria-label", "Not started");

    await typeInto("src/math.js", "export const add = () => 0;");
    expect(marker(/Add numbers/)).toHaveAttribute("aria-label", "Attempted");
    expect(screen.getByTestId("progress")).toHaveTextContent("1 in progress");

    await runTests();
    await screen.findByTestId("results");
    expect(marker(/Add numbers/)).toHaveAttribute("aria-label", "Attempted");

    await typeInto("src/math.js", FIXED);
    await runTests();
    await waitFor(() => expect(marker(/Add numbers/)).toHaveAttribute("aria-label", "Solved"));
  });

  it("running the tests counts as an attempt", async () => {
    renderLab();
    await runTests();
    await screen.findByTestId("results");
    expect(marker(/Add numbers/)).toHaveAttribute("aria-label", "Attempted");
  });

  it("revealing the solution never marks the exercise as solved", async () => {
    renderLab();
    await userEvent.click(screen.getByRole("tab", { name: "Solution" }));
    await userEvent.click(screen.getByRole("button", { name: /Reveal solution/ }));
    expect(screen.getByTestId("progress")).toHaveTextContent("0 / 3 solved");
    expect(marker(/Add numbers/)).toHaveAttribute("aria-label", "Not started");
  });
});

describe("hints and solution", () => {
  it("reveals hints one at a time without touching the editor", async () => {
    renderLab();
    await typeInto("src/math.js", "export const add = () => 'mine';");
    await userEvent.click(screen.getByRole("tab", { name: /Hints/ }));
    expect(screen.queryByText(/First hint text/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Show hint 1 of 2/ }));
    expect(screen.getByText(/First hint text/)).toBeInTheDocument();
    expect(screen.queryByText(/Second hint text/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Show hint 2 of 2/ }));
    expect(screen.getByText(/Second hint text/)).toBeInTheDocument();
    expect(valueOf("src/math.js")).toBe("export const add = () => 'mine';");
    expect(screen.getByRole("tab", { name: "Hints (2/2)" })).toBeInTheDocument();
  });

  it("hides the solution until revealed, then shows it read-only and keeps the learner's code", async () => {
    renderLab();
    await typeInto("src/math.js", "export const add = () => 'mine';");
    await userEvent.click(screen.getByRole("tab", { name: "Solution" }));
    expect(screen.queryByLabelText("Reference solution: src/math.js")).not.toBeInTheDocument();
    expect(screen.queryByText("Use plus.")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Reveal solution/ }));
    const solution = screen.getByLabelText("Reference solution: src/math.js");
    const view = EditorView.findFromDOM(solution.closest(".cm-editor") as HTMLElement)!;
    expect(view.state.doc.toString()).toBe(FIXED);
    expect(view.state.readOnly).toBe(true);
    expect(screen.getByText("Used minus instead of plus.")).toBeInTheDocument();
    expect(screen.getByText("Use plus.")).toBeInTheDocument();

    // The learner's own code is untouched and still the code that gets tested.
    expect(valueOf("src/math.js")).toBe("export const add = () => 'mine';");
    await runTests();
    expect(await screen.findByTestId("results")).toHaveTextContent("0 of 1 tests passed");
  });

  it("remembers revealed hints and solution per question", async () => {
    renderLab();
    await userEvent.click(screen.getByRole("tab", { name: /Hints/ }));
    await userEvent.click(screen.getByRole("button", { name: /Show hint 1/ }));
    await userEvent.click(screen.getByRole("tab", { name: "Solution" }));
    await userEvent.click(screen.getByRole("button", { name: /Reveal solution/ }));

    await userEvent.click(screen.getByRole("button", { name: "Next question" }));
    await userEvent.click(screen.getByRole("tab", { name: /Hints/ }));
    expect(screen.queryByText(/First hint text/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Previous question" }));
    expect(screen.getByRole("tab", { name: "Hints (1/2)" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Solution" }));
    expect(screen.getByLabelText("Reference solution: src/math.js")).toBeInTheDocument();
  });
});

describe("reset", () => {
  it("asks for confirmation, can be cancelled, and restores the starter code", async () => {
    renderLab();
    await typeInto("src/math.js", "export const add = () => 'mine';");
    expect(screen.getByText("You have edits in this exercise")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Reset/ }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(valueOf("src/math.js")).toBe("export const add = () => 'mine';");

    await userEvent.click(screen.getByRole("button", { name: /Reset/ }));
    await userEvent.click(screen.getByRole("button", { name: "Yes, reset" }));
    expect(valueOf("src/math.js")).toBe(BUGGY);
    expect(screen.getByText("Starter code")).toBeInTheDocument();
  });

  it("clears previous results but keeps the solved status", async () => {
    renderLab();
    await typeInto("src/math.js", FIXED);
    await runTests();
    await waitFor(() => expect(screen.getByTestId("results")).toHaveTextContent("All 1 tests passed"));
    await userEvent.click(screen.getByRole("button", { name: /Reset/ }));
    await userEvent.click(screen.getByRole("button", { name: "Yes, reset" }));
    expect(screen.queryByTestId("results")).not.toBeInTheDocument();
    expect(screen.getByTestId("progress")).toHaveTextContent("1 / 3 solved");
  });
});

describe("live preview, console and errors", () => {
  const frame = () => screen.getByTitle("Live preview") as HTMLIFrameElement;
  /** Simulates a message posted by the sandboxed iframe. */
  const fromSandbox = (data: unknown) =>
    act(() => {
      window.dispatchEvent(new MessageEvent("message", { data, source: frame().contentWindow }));
    });

  it("offers Preview only for UI exercises and keeps it in an opaque-origin sandbox", () => {
    renderLab("/practice/greet");
    expect(screen.getByRole("tab", { name: "Preview" })).toBeInTheDocument();
    expect(frame().getAttribute("sandbox")).toBe("allow-scripts allow-forms");
    expect(frame().getAttribute("sandbox")).not.toContain("allow-same-origin");
    cleanup();
    renderLab("/practice/add");
    expect(screen.queryByRole("tab", { name: "Preview" })).not.toBeInTheDocument();
  });

  it("Run sends the CURRENT edited code (not the solution) to the sandbox", async () => {
    renderLab("/practice/greet");
    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    await typeInto("src/Greeting.jsx", "export default function Greeting() { return <p>edited by learner</p>; }");
    await run();
    const sent = post.mock.calls.map((c) => c[0]).find((m) => m?.type === "preview");
    expect(sent.entry).toBe("src/Demo.jsx");
    expect(sent.ui).toBe(true);
    expect(sent.modules["src/Greeting.jsx"]).toContain("edited by learner");
    expect(sent.modules["src/Greeting.jsx"]).not.toContain("solved");
    expect(Object.keys(sent.modules).sort()).toEqual(["src/Demo.jsx", "src/Greeting.jsx"]);
  });

  it("Run with a syntax error shows the error in the preview and console without calling the sandbox", async () => {
    renderLab("/practice/greet");
    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    await typeInto("src/Greeting.jsx", "export default function Greeting() { return <p>;");
    await run();
    expect(post.mock.calls.some((c) => c[0]?.type === "preview")).toBe(false);
    expect((await screen.findAllByRole("alert")).length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("tab", { name: /Console/ }));
    expect(screen.getByLabelText("Console output")).toHaveTextContent(/Syntax error in src\/Greeting\.jsx/);
  });

  it("shows console.log / warn / error from the sandbox in the Console tab with a count", async () => {
    renderLab("/practice/greet");
    await fromSandbox({ type: "console", level: "log", text: "total 3", source: "preview" });
    await fromSandbox({ type: "console", level: "warn", text: "low stock", source: "preview" });
    await fromSandbox({ type: "console", level: "error", text: "Failed to load products", source: "preview" });

    expect(screen.getByRole("tab", { name: /Console/ })).toHaveTextContent("3");
    await userEvent.click(screen.getByRole("tab", { name: /Console/ }));
    const list = screen.getByLabelText("Console output");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((li) => li.getAttribute("data-level"))).toEqual(["log", "warn", "error"]);
    expect(list).toHaveTextContent("total 3");
    expect(list).toHaveTextContent("Failed to load products");

    await userEvent.click(screen.getByRole("button", { name: /Clear/ }));
    expect(screen.getByText("Console is empty")).toBeInTheDocument();
  });

  it("shows runtime errors from the preview with a collapsible stack trace", async () => {
    renderLab("/practice/greet");
    await run(); // token 1
    await fromSandbox({
      type: "preview-status",
      token: 1,
      ok: false,
      error: "TypeError: Cannot read properties of null",
      stack: "TypeError: x\n    at Greeting (src/Greeting.jsx:1:30)",
    });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Runtime error");
    expect(alert).toHaveTextContent("Cannot read properties of null");
    expect(alert).toHaveTextContent("src/Greeting.jsx:1:30");
  });

  it("ignores status messages from a previous run (stale token)", async () => {
    renderLab("/practice/greet");
    await run(); // token 1
    await run(); // token 2
    await fromSandbox({ type: "preview-status", token: 1, ok: false, error: "old failure", stack: "" });
    expect(screen.queryByText(/old failure/)).not.toBeInTheDocument();
  });

  it("restarting the preview replaces the iframe and re-runs the last code", async () => {
    renderLab("/practice/greet");
    await run();
    const before = frame();
    await userEvent.click(screen.getByRole("button", { name: /Restart preview/ }));
    const after = frame();
    expect(after).not.toBe(before);
    expect(screen.getAllByText("Starting sandbox…").length).toBeGreaterThan(0);

    const post = vi.spyOn(after.contentWindow!, "postMessage");
    await fromSandbox({ type: "ready" });
    expect(post.mock.calls.some((c) => c[0]?.type === "preview")).toBe(true);
  });

  it("auto-runs once when the sandbox reports ready", async () => {
    renderLab("/practice/greet");
    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    await fromSandbox({ type: "ready" });
    expect(post.mock.calls.filter((c) => c[0]?.type === "preview")).toHaveLength(1);
  });

  it("keeps the preview mounted while other tabs are shown", async () => {
    renderLab("/practice/greet");
    const before = frame();
    await userEvent.click(screen.getByRole("tab", { name: /Tests/ }));
    await userEvent.click(screen.getByRole("tab", { name: "Preview" }));
    expect(frame()).toBe(before);
  });

  it("logic-only exercises still run code and show its output in the Console", async () => {
    renderLab("/practice/add");
    await run();
    expect(screen.getByRole("tab", { name: /Console/ })).toHaveAttribute("aria-selected", "true");
  });
});

describe("resizable panels", () => {
  it("resizes the editor with the keyboard", () => {
    renderLab();
    const handle = screen.getByRole("separator", { name: "Resize editor" });
    const start = Number(handle.getAttribute("aria-valuenow"));
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeGreaterThan(start);
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    fireEvent.keyDown(handle, { key: "ArrowUp" });
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeLessThan(start);
  });

  it("resizes by dragging", () => {
    renderLab();
    const handle = screen.getByRole("separator", { name: "Resize editor" });
    const start = Number(handle.getAttribute("aria-valuenow"));
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 160, pointerId: 1 });
    fireEvent.pointerUp(handle, { pointerId: 1 });
    expect(Number(handle.getAttribute("aria-valuenow"))).toBe(start + 60);
  });
});

describe("build exercises", () => {
  const BUILD_STARTER = "export default function Card() { return <p>TODO</p>; }\n";
  const BUILD_SOLUTION = "export default function Card() { return <p>Target card</p>; }\n";
  const BUILD_DEMO = 'import Card from "./Card";\nexport default function Demo() { return <Card />; }\n';
  const build = make({
    id: "card-build",
    title: "Build the card",
    kind: "build",
    uiSpec: ["A rounded card with a heading", "Shows the price with two decimals"],
    previewEntry: "src/Demo.jsx",
    editableFiles: ["src/Card.jsx"],
    files: [
      { path: "src/Card.jsx", starter: BUILD_STARTER, solution: BUILD_SOLUTION, editable: true },
      { path: "src/Demo.jsx", starter: BUILD_DEMO, solution: BUILD_DEMO, editable: false },
    ],
    testCode: "import Card from \"./src/Card\"; it(\"renders target\", () => expect(typeof Card).toBe(\"function\"));",
  });
  const MIXED = [SET[0], build];

  it("filters the list by exercise type", async () => {
    renderLab("/practice/add", MIXED);
    const nav = () => screen.getAllByRole("navigation", { name: "Questions", hidden: true })[0];
    await userEvent.click(within(nav()).getByRole("button", { name: "Build", pressed: false, hidden: true }));
    expect(within(nav()).getByText("Build the card")).toBeInTheDocument();
    expect(within(nav()).queryByText("Add numbers")).not.toBeInTheDocument();
    await userEvent.click(within(nav()).getByRole("button", { name: "Fix bugs", hidden: true }));
    expect(within(nav()).getByText("Add numbers")).toBeInTheDocument();
    expect(within(nav()).queryByText("Build the card")).not.toBeInTheDocument();
  });

  it("shows the Build badge, the UI requirements and renames the preview tab", () => {
    renderLab("/practice/card-build", MIXED);
    expect(screen.getByText("Build a feature")).toBeInTheDocument();
    expect(screen.getByText("UI requirements")).toBeInTheDocument();
    expect(screen.getByText("Shows the price with two decimals")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Your build" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Target UI" })).toBeInTheDocument();
  });

  it("debug exercises have no Target UI tab", () => {
    renderLab("/practice/greet");
    expect(screen.queryByRole("tab", { name: "Target UI" })).not.toBeInTheDocument();
  });

  it("the Target UI tab renders the reference solution, never the learner code", async () => {
    renderLab("/practice/card-build", MIXED);
    await typeInto("src/Card.jsx", "export default function Card() { return <p>my own attempt</p>; }");
    await userEvent.click(screen.getByRole("tab", { name: "Target UI" }));
    const frames = screen.getAllByTitle("Live preview") as HTMLIFrameElement[];
    const target = frames[frames.length - 1];
    const post = vi.spyOn(target.contentWindow!, "postMessage");
    act(() => {
      window.dispatchEvent(new MessageEvent("message", { data: { type: "ready" }, source: target.contentWindow }));
    });
    const sent = post.mock.calls.map((c) => c[0]).find((m) => m?.type === "preview");
    expect(sent.modules["src/Card.jsx"]).toContain("Target card");
    expect(sent.modules["src/Card.jsx"]).not.toContain("my own attempt");
    expect(screen.getByText(/Reference rendering of the finished feature/)).toBeInTheDocument();
  });
});

describe("sharing", () => {
  it("copies a deep link to the current question", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderLab("/practice/greet");
    await userEvent.click(screen.getByRole("button", { name: /Copy link/ }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/practice/greet`);
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });
});

describe("focus mode", () => {
  it("hides the question list and the problem text, keeps the editor and outputs, and restores them", async () => {
    renderLab();
    expect(screen.getByRole("tablist", { name: "Exercise sections" })).toBeInTheDocument();
    expect(screen.getAllByRole("navigation", { name: "Questions", hidden: true }).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "Focus mode" }));
    expect(screen.getByRole("button", { name: "Show panels", pressed: true })).toBeInTheDocument();
    expect(screen.queryByRole("tablist", { name: "Exercise sections" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Questions", hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Output" })).toBeInTheDocument();
    expect(valueOf("src/math.js")).toBe(BUGGY);

    // Still fully usable: edit and run tests while focused.
    await typeInto("src/math.js", FIXED);
    await runTests();
    await waitFor(() => expect(screen.getByTestId("results")).toHaveTextContent("All 1 tests passed"));

    await userEvent.click(screen.getByRole("button", { name: "Show panels" }));
    expect(screen.getByRole("tablist", { name: "Exercise sections" })).toBeInTheDocument();
    expect(valueOf("src/math.js")).toBe(FIXED);
  });
});

describe("the real question bank", () => {
  it("renders with the in-process runner and lists every question", () => {
    render(
      <MemoryRouter initialEntries={["/practice/" + EXERCISES[0].id]}>
        <Routes>
          <Route path="/practice/:id" element={<PracticeLab runner={inProcessRunner} />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: EXERCISES[0].title, level: 2 })).toBeInTheDocument();
    expect(screen.getByTestId("progress")).toHaveTextContent(`0 / ${EXERCISES.length} solved`);
    expect(screen.getByRole("tab", { name: new RegExp(EXERCISES[0].editableFiles[0].split("/").pop()!) })).toBeInTheDocument();
  });
});
