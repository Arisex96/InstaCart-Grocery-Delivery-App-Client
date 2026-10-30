import { transform } from "sucrase";
import type { ModuleMap } from "./modules";

export interface SyntaxProblem {
  path: string;
  message: string;
  /** 1-based, when the parser reported a position. */
  line?: number;
  column?: number;
}

export type TranspileResult = { ok: true; js: string } | ({ ok: false } & SyntaxProblem);

/**
 * Turns learner JSX/ES-module source into CommonJS that the sandbox can
 * evaluate. Runs in the host page (trusted code) — only the *output* is sent
 * to the sandboxed iframe.
 */
export function transpile(source: string, path: string): TranspileResult {
  try {
    const { code } = transform(source, {
      transforms: ["jsx", "imports"],
      jsxRuntime: "automatic",
      production: true,
      filePath: path,
    });
    return { ok: true, js: code };
  } catch (err) {
    const e = err as Error & { loc?: { line: number; column: number } };
    return {
      ok: false,
      path,
      // Sucrase prefixes "Error transforming <file>:" and suffixes "(line:col)"; we show both separately.
      message: e.message.replace(/^Error transforming [^:]+:\s*/, "").replace(/\s*\(\d+:\d+\)$/, ""),
      line: e.loc?.line,
      column: e.loc ? e.loc.column + 1 : undefined,
    };
  }
}

export const describeProblem = (p: SyntaxProblem) =>
  `Syntax error in ${p.path}${p.line ? ` (line ${p.line}, column ${p.column})` : ""}: ${p.message}`;

export type TranspileAllResult = { ok: true; modules: ModuleMap } | { ok: false; problem: SyntaxProblem };

/** Transpiles every file; stops at the first syntax error. */
export function transpileAll(files: Record<string, string>): TranspileAllResult {
  const modules: ModuleMap = {};
  for (const [path, source] of Object.entries(files)) {
    const result = transpile(source, path);
    if (!result.ok) return { ok: false, problem: result };
    modules[path] = result.js;
  }
  return { ok: true, modules };
}
