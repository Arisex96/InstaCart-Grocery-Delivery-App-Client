import type { SuiteRequest, TestReport } from "./engine";
import type { SessionOptions, SuiteRunner, SuiteSession } from "./exerciseRunner";
import runtimeBundle from "./runtime/runtime.bundle.js?raw";
import tailwindBrowser from "../../../../node_modules/@tailwindcss/browser/dist/index.global.js?raw";
import { BASE_CSS, THEME_CSS } from "./previewStyles";

/**
 * Host side of the sandbox. Learner code only ever executes inside an iframe
 * with `sandbox="allow-scripts allow-forms"` (no `allow-same-origin`), which
 * gives it an opaque origin: no access to this page's DOM, storage, cookies or
 * auth tokens, and no way to navigate the top window. It runs in the browser,
 * never on the server.
 */
// allow-forms: without it Chrome never fires `submit`, so form exercises could not work.
// A submit that is not prevented would navigate (and reload) the frame; the runtime entry
// redirects those to a hidden sink frame (CSP `form-action` is ignored in <meta> policies).
export const SANDBOX_ATTRIBUTE = "allow-scripts allow-forms";

// "</script" inside a bundle would end the inline script early.
const inlineScript = (code: string) => `<script>${code.replace(/<\/script/gi, "<\\/script")}</script>`;

/**
 * @param styled include Tailwind + the InstaCart theme (live preview). Test
 *   runner frames skip it: they are invisible and the extra script is wasted.
 */
export function buildSrcDoc({ styled = true } = {}): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8">` +
    // No network at all; only inline scripts/styles and data: images.
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:;">` +
    `<style>${BASE_CSS}</style>` +
    (styled ? `<style type="text/tailwindcss">${THEME_CSS}</style>${inlineScript(tailwindBrowser)}` : "") +
    `</head><body><div id="root"></div>${inlineScript(runtimeBundle)}</body></html>`
  );
}

function createFrame(): HTMLIFrameElement {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", SANDBOX_ATTRIBUTE);
  frame.setAttribute("title", "Test runner");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
  frame.srcdoc = buildSrcDoc({ styled: false });
  return frame;
}

const RUN_TIMEOUT_MS = 20_000;

function waitForMessage<T>(
  frame: HTMLIFrameElement,
  match: (data: { type?: string; id?: number }) => boolean,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || !match(event.data ?? {})) return;
      cleanup();
      resolve(event.data as T);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(timeoutMessage));
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
    };
    window.addEventListener("message", onMessage);
  });
}

/** One hidden iframe reused for the (few) suites that make up a single check. */
function createSandboxSession({ onConsole }: SessionOptions = {}): SuiteSession {
  const frame = createFrame();
  document.body.appendChild(frame);
  const ready = waitForMessage(frame, (d) => d.type === "ready", 10_000, "The sandbox failed to start.");
  let nextId = 1;

  const forwardConsole = (event: MessageEvent) => {
    if (event.source !== frame.contentWindow || event.data?.type !== "console") return;
    onConsole?.({ level: event.data.level, text: event.data.text, source: "tests" });
  };
  window.addEventListener("message", forwardConsole);

  return {
    async run(request: SuiteRequest): Promise<TestReport> {
      await ready;
      const id = nextId++;
      const result = waitForMessage<{ report: TestReport }>(
        frame,
        (d) => d.type === "tests-result" && d.id === id,
        RUN_TIMEOUT_MS,
        `The run took longer than ${RUN_TIMEOUT_MS / 1000}s and was stopped. ` +
          `Check for an infinite loop or a render loop.`,
      );
      frame.contentWindow?.postMessage({ type: "run-tests", id, ...request }, "*");
      return (await result).report;
    },
    dispose() {
      window.removeEventListener("message", forwardConsole);
      frame.remove();
    },
  };
}

export const sandboxRunner: SuiteRunner = { createSession: createSandboxSession };
