import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileCode2, Lock } from "lucide-react";
import type { Exercise } from "../data/types";
import type { SyntaxProblem } from "../runner/transpile";
import CodeEditor from "./CodeEditor";

interface EditorPanelProps {
  exercise: Exercise;
  /** Current contents of every file in the workspace. */
  files: Record<string, string>;
  onChange: (path: string, content: string) => void;
  onRun: () => void;
  problems: Record<string, SyntaxProblem>;
  isFileModified: (path: string) => boolean;
  height: number;
}

const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1);

/** File tabs + CodeMirror editor + a status line with compile diagnostics. */
export default function EditorPanel({ exercise, files, onChange, onRun, problems, isFileModified, height }: EditorPanelProps) {
  const [active, setActive] = useState(exercise.editableFiles[0] ?? exercise.files[0]?.path);
  const file = exercise.files.find((f) => f.path === active) ?? exercise.files[0];
  if (!file) return null;

  const problem = problems[file.path];
  const totalProblems = Object.keys(problems).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-app-border bg-[#14211a]">
      <div role="tablist" aria-label="Files" className="flex overflow-x-auto bg-black/30 text-xs">
        {exercise.files.map((f) => {
          const selected = f.path === file.path;
          return (
            <button
              key={f.path}
              role="tab"
              aria-selected={selected}
              title={f.editable ? f.path : `${f.path} (read-only context)`}
              onClick={() => setActive(f.path)}
              className={`flex shrink-0 items-center gap-1.5 border-r border-white/5 px-3 py-2 ${
                selected ? "bg-[#14211a] text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {f.editable ? <FileCode2 className="size-3.5" /> : <Lock className="size-3.5" aria-label="read-only" />}
              <span>{basename(f.path)}</span>
              {problems[f.path] && <span aria-label="has errors" className="size-1.5 rounded-full bg-red-400" />}
              {isFileModified(f.path) && <span aria-label="edited" className="size-1.5 rounded-full bg-app-orange" />}
            </button>
          );
        })}
      </div>

      <div className="px-3 py-1 text-[11px] text-white/45">
        {file.path}
        {!file.editable && " — read-only context (the preview and tests use it as is)"}
      </div>

      {/* key: a fresh editor (and undo history) per file */}
      <CodeEditor
        key={file.path}
        value={files[file.path] ?? file.starter}
        readOnly={!file.editable}
        onChange={(value) => file.editable && onChange(file.path, value)}
        onRun={onRun}
        label={`Code editor: ${file.path}`}
        problems={problem ? [{ line: problem.line ?? 1, column: problem.column, message: problem.message }] : []}
        height={height}
      />

      <div
        role="status"
        className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
          totalProblems ? "bg-red-950/60 text-red-200" : "bg-black/30 text-white/60"
        }`}
      >
        {totalProblems ? (
          <>
            <AlertTriangle className="size-3.5 shrink-0" />
            <span data-testid="diagnostics">
              {Object.values(problems)
                .map((p) => `${p.path}${p.line ? `:${p.line}:${p.column}` : ""} ${p.message}`)
                .join(" · ")}
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            <span>No syntax errors</span>
          </>
        )}
      </div>
    </div>
  );
}
