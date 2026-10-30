import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentLess, indentMore } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { lintGutter, setDiagnostics, type Diagnostic } from "@codemirror/lint";

export interface EditorProblem {
  /** 1-based. */
  line: number;
  column?: number;
  message: string;
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  /** Accessible name of the editing surface. */
  label: string;
  /** Called on Ctrl/Cmd+Enter. */
  onRun?: () => void;
  /** Syntax problems to underline and list in the gutter. */
  problems?: EditorProblem[];
  /** Pixel height of the editor. */
  height?: number | string;
}

const theme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "#14211a", fontSize: "13px" },
  ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", lineHeight: "1.55" },
  ".cm-gutters": { backgroundColor: "#101a14", color: "#6f8a78", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.05)" },
  "&.cm-focused": { outline: "2px solid rgba(249,115,22,0.6)", outlineOffset: "-2px" },
});

function toDiagnostics(view: EditorView, problems: EditorProblem[]): Diagnostic[] {
  const doc = view.state.doc;
  return problems.map((p) => {
    const line = doc.line(Math.min(Math.max(p.line, 1), doc.lines));
    const from = Math.min(line.from + Math.max((p.column ?? 1) - 1, 0), line.to);
    return { from, to: Math.min(Math.max(from + 1, from), doc.length), severity: "error", message: p.message };
  });
}

/**
 * CodeMirror 6 editor: syntax highlighting (JSX), line numbers, bracket
 * matching and auto-closing, indentation, history, search and inline
 * diagnostics for compile errors.
 *
 * Accessibility: Tab indents, but pressing Escape first lets the next Tab move
 * focus out of the editor (so keyboard users are not trapped).
 */
export default function CodeEditor({ value, onChange, readOnly = false, label, onRun, problems, height = 360 }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const readOnlyCompartment = useRef(new Compartment());

  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  });

  useEffect(() => {
    let tabReleased = false;
    const view = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          javascript({ jsx: true }),
          oneDark,
          theme,
          lintGutter(),
          readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
          EditorView.contentAttributes.of({ "aria-label": label, "data-testid": "code-editor" }),
          keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                onRunRef.current?.();
                return true;
              },
            },
            {
              key: "Escape",
              run: () => {
                tabReleased = true;
                return false;
              },
            },
            {
              key: "Tab",
              run: (v) => {
                if (tabReleased) {
                  tabReleased = false;
                  return false;
                }
                return indentMore(v);
              },
              shift: indentLess,
            },
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current?.(update.state.doc.toString());
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor is created once per mount; parents remount it (key) per file.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External value changes (reset, switching exercise state) flow into the editor.
  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (view) view.dispatch(setDiagnostics(view.state, toDiagnostics(view, problems ?? [])));
  }, [problems, value]);

  return <div ref={host} className="overflow-hidden rounded-xl border border-app-border" style={{ height }} />;
}
