/**
 * Entry point of the sandbox iframe. Built into `runtime.bundle.js` by
 * `npm run build:practice-runtime` (see vite.practice-runtime.config.ts).
 *
 * The iframe is created with `sandbox="allow-scripts allow-forms"` only, so it
 * has an opaque origin: it cannot read the host page's DOM, cookies,
 * localStorage or tokens. It talks to the host exclusively through postMessage.
 */
import { createElement, Component, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { runTestSuite, type SuiteRequest } from "../engine";
import { cleanup, externals } from "../externals";
import { formatArgs, type ConsoleLevel } from "../console";
import { createRequire, fixStack, type ModuleMap } from "../modules";

type HostMessage =
  | ({ type: "run-tests"; id: number } & SuiteRequest)
  | { type: "preview"; token: number; modules: ModuleMap; entry: string; ui: boolean }
  | { type: "preview-clear" };

const post = (message: unknown) => window.parent.postMessage(message, "*");

// ---- console capture -------------------------------------------------------
let channel: "preview" | "tests" = "preview";
let knownFiles: ModuleMap = {};
let sent = 0;
const MAX_CONSOLE_MESSAGES = 500;

for (const level of ["log", "info", "warn", "error", "debug"] as ConsoleLevel[]) {
  const original = console[level].bind(console);
  console[level] = (...args: unknown[]) => {
    original(...args);
    if (sent++ < MAX_CONSOLE_MESSAGES) {
      post({ type: "console", level, text: fixStack(formatArgs(args), knownFiles), source: channel });
    }
  };
}

const reportError = (error: unknown, prefix = "") => {
  const e = error as Error;
  const text = fixStack(e?.stack || `${e?.name ?? "Error"}: ${e?.message ?? String(error)}`, knownFiles);
  post({ type: "console", level: "error", text: prefix + text, source: channel });
  return text;
};

// ---- live preview ----------------------------------------------------------
let currentToken = 0;

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    post({
      type: "preview-status",
      token: currentToken,
      ok: false,
      error: `${error.name}: ${error.message}`,
      stack: fixStack(error.stack ?? "", knownFiles),
    });
  }
  render() {
    return this.state.error
      ? createElement(
          "pre",
          { style: { color: "#b91c1c", whiteSpace: "pre-wrap", fontSize: 13 } },
          `Render error: ${this.state.error.message}`,
        )
      : this.props.children;
  }
}

let root: Root | null = null;

function unmountPreview() {
  root?.unmount();
  root = null;
}

function showPreview(msg: Extract<HostMessage, { type: "preview" }>) {
  channel = "preview";
  sent = 0;
  knownFiles = msg.modules;
  currentToken = msg.token;
  unmountPreview();
  const container = document.getElementById("root");
  if (!container) return;
  container.textContent = "";
  try {
    const { load } = createRequire(msg.modules, externals);
    const exports = load(msg.entry);
    if (!msg.ui) {
      post({ type: "preview-status", token: msg.token, ok: true });
      return;
    }
    // `in` first: reading a missing export on a guarded module throws a generic message.
    const Demo = ("default" in exports ? exports.default : undefined) as (() => ReactNode) | undefined;
    if (typeof Demo !== "function") {
      throw new Error(`Nothing to preview: ${msg.entry} needs a default export that is a React component.`);
    }
    root = createRoot(container);
    // The preview gets its own in-memory router and toast host, so components
    // that call useNavigate()/toast() behave as they do in the app without ever
    // touching the real URL.
    root.render(
      createElement(
        Boundary,
        null,
        createElement(MemoryRouter, null, createElement(Toaster, { position: "bottom-right" }), createElement(Demo)),
      ),
    );
    post({ type: "preview-status", token: msg.token, ok: true });
  } catch (err) {
    const stack = reportError(err);
    const e = err as Error;
    post({ type: "preview-status", token: msg.token, ok: false, error: e.message ?? String(err), stack });
  }
}

window.addEventListener("message", async (event: MessageEvent<HostMessage>) => {
  if (event.source !== window.parent) return;
  const msg = event.data;
  if (msg?.type === "run-tests") {
    channel = "tests";
    sent = 0;
    knownFiles = { ...msg.modules, [msg.testsPath]: msg.testsJs };
    const report = await runTestSuite(msg, { externals, cleanup, passThroughConsole: true });
    if (report.errorStack) report.errorStack = fixStack(report.errorStack, knownFiles);
    post({ type: "tests-result", id: msg.id, report });
  } else if (msg?.type === "preview") {
    showPreview(msg);
  } else if (msg?.type === "preview-clear") {
    unmountPreview();
  }
});

window.addEventListener("error", (e) => {
  const stack = reportError(e.error ?? new Error(e.message));
  post({ type: "preview-status", token: currentToken, ok: false, error: e.message, stack });
});
window.addEventListener("unhandledrejection", (e) => {
  const reason = e.reason as Error;
  const stack = reportError(reason, "Unhandled promise rejection: ");
  post({
    type: "preview-status",
    token: currentToken,
    ok: false,
    error: `Unhandled promise rejection: ${reason?.message ?? String(reason)}`,
    stack,
  });
});

// ---- form navigation guard --------------------------------------------------
// A <form> submitted without preventDefault() navigates its frame, which would
// reload this sandbox and silently kill the running preview or test run. (CSP
// `form-action` cannot stop it: it is ignored in <meta> policies.) Point every
// submit at a hidden, script-less sink frame instead, and tell the learner what
// would have happened in a real page. This never touches `defaultPrevented`, so
// tests that check "does the handler call preventDefault()" stay truthful.
const SINK = "__form_sink__";
const sink = document.createElement("iframe");
sink.name = SINK;
sink.setAttribute("sandbox", "");
sink.style.display = "none";
document.body.appendChild(sink);

window.addEventListener(
  "submit",
  (e) => {
    if (e.target instanceof HTMLFormElement) e.target.target = SINK;
  },
  true,
);
window.addEventListener("submit", (e) => {
  if (!e.defaultPrevented) {
    console.warn(
      "A form was submitted without event.preventDefault(). In a real page this reloads the page; the sandbox blocked the navigation.",
    );
  }
});

post({ type: "ready" });
