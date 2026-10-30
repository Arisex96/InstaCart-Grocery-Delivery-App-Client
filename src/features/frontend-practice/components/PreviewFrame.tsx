import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { ModuleMap } from "../runner/modules";
import type { ConsoleEntry } from "../runner/console";
import { buildSrcDoc, SANDBOX_ATTRIBUTE } from "../runner/sandbox";

export interface RunPayload {
  modules: ModuleMap;
  entry: string;
  /** true: render the entry's default export; false: just execute the file. */
  ui: boolean;
}

export type PreviewStatus = "booting" | "idle" | "running" | "ok" | "error";

export interface PreviewHandle {
  /** Executes the (already transpiled) workspace in the sandbox. */
  run: (payload: RunPayload) => void;
  /** Throws the iframe away and starts a fresh one, then re-runs the last payload. */
  restart: () => void;
  /** Shows a problem found before anything could run (e.g. a syntax error). */
  fail: (message: string) => void;
}

interface PreviewFrameProps {
  /** Whether this exercise has a visual preview (otherwise Run only produces console output). */
  ui: boolean;
  onConsole: (entry: ConsoleEntry) => void;
  /** Fires once per iframe boot, when the sandbox is ready to run code. */
  onReady?: () => void;
  onStatus?: (status: PreviewStatus, error?: string) => void;
}

interface RuntimeError {
  message: string;
  stack?: string;
}

/**
 * The live preview: renders the learner's code inside the same opaque-origin
 * sandbox used for tests. The iframe stays mounted while other tabs are shown,
 * so the preview keeps its state; "Restart" replaces it with a fresh one.
 */
const PreviewFrame = forwardRef<PreviewHandle, PreviewFrameProps>(function PreviewFrame(
  { ui, onConsole, onReady, onStatus },
  ref,
) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const lastPayload = useRef<RunPayload | null>(null);
  const token = useRef(0);
  const callbacks = useRef({ onConsole, onReady, onStatus });
  const srcDoc = useMemo(() => buildSrcDoc({ styled: true }), []);
  const [generation, setGeneration] = useState(0);
  const [status, setStatusState] = useState<PreviewStatus>("booting");
  const [error, setError] = useState<RuntimeError | null>(null);

  useEffect(() => {
    callbacks.current = { onConsole, onReady, onStatus };
  });

  const setStatus = useCallback((next: PreviewStatus, message?: string) => {
    setStatusState(next);
    callbacks.current.onStatus?.(next, message);
  }, []);

  const post = useCallback((message: unknown) => frameRef.current?.contentWindow?.postMessage(message, "*"), []);

  const run = useCallback(
    (payload: RunPayload) => {
      lastPayload.current = payload;
      setError(null);
      setStatus("running");
      token.current += 1;
      post({ type: "preview", token: token.current, ...payload });
    },
    [post, setStatus],
  );

  useImperativeHandle(
    ref,
    () => ({
      run,
      fail: (message: string) => {
        setError({ message });
        setStatus("error", message);
      },
      restart: () => {
        setError(null);
        setStatus("booting");
        setGeneration((g) => g + 1);
      },
    }),
    [run, setStatus],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data ?? {};
      if (data.type === "ready") {
        setStatus("idle");
        // After a restart, bring the previous code back up automatically.
        if (generation > 0 && lastPayload.current) run(lastPayload.current);
        else callbacks.current.onReady?.();
      } else if (data.type === "console") {
        callbacks.current.onConsole({ level: data.level, text: data.text, source: data.source ?? "preview" });
      } else if (data.type === "preview-status" && data.token === token.current) {
        if (data.ok) {
          setError(null);
          setStatus("ok");
        } else {
          setError({ message: data.error, stack: data.stack });
          setStatus("error", data.error);
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [generation, run, setStatus]);

  const statusLabel: Record<PreviewStatus, string> = {
    booting: "Starting sandbox…",
    idle: "Ready",
    running: "Running…",
    ok: ui ? "Running" : "Executed",
    error: "Error",
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-app-border bg-app-cream/60 px-3 py-1.5 text-xs">
        <span
          role="status"
          data-status={status}
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${
            status === "error"
              ? "bg-red-100 text-red-800"
              : status === "ok"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {(status === "booting" || status === "running") && <Loader2 className="size-3 animate-spin" />}
          {statusLabel[status]}
        </span>
        {!ui && <span className="text-app-text-light">This exercise has no UI — see the Console tab for output.</span>}
        <button
          onClick={() => {
            setError(null);
            setStatus("booting");
            setGeneration((g) => g + 1);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-app-border bg-white px-2.5 py-1 font-medium hover:bg-app-cream"
        >
          <RefreshCw className="size-3" /> Restart preview
        </button>
      </div>

      {error && (
        <div role="alert" className="border-b border-red-200 bg-red-50 p-3 text-xs text-red-900">
          <p className="font-semibold">Runtime error</p>
          <p className="mt-1 whitespace-pre-wrap font-mono">{error.message}</p>
          {error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-red-800">Stack trace</summary>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[11px]">{error.stack}</pre>
            </details>
          )}
        </div>
      )}

      <iframe
        key={generation}
        ref={frameRef}
        title="Live preview"
        sandbox={SANDBOX_ATTRIBUTE}
        srcDoc={srcDoc}
        className={`w-full flex-1 bg-app-cream ${ui ? "min-h-[300px]" : "hidden"}`}
      />
    </div>
  );
});

export default PreviewFrame;
