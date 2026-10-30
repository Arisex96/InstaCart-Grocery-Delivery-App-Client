import { useEffect, useState } from "react";
import { transpile, type SyntaxProblem } from "../runner/transpile";

/**
 * Compile diagnostics for the editable files, recomputed shortly after the
 * learner stops typing. Runs in the host (Sucrase only parses, it never
 * executes anything).
 */
export function useSyntaxProblems(files: Record<string, string>, editable: string[], delayMs = 350) {
  const [problems, setProblems] = useState<Record<string, SyntaxProblem>>({});
  const signature = editable.map((p) => files[p]).join("\u0000");

  useEffect(() => {
    const timer = setTimeout(() => {
      const next: Record<string, SyntaxProblem> = {};
      for (const path of editable) {
        const result = transpile(files[path] ?? "", path);
        if (!result.ok) next[path] = result;
      }
      setProblems(next);
    }, delayMs);
    return () => clearTimeout(timer);
    // `signature` covers the file contents; `files`/`editable` identities change every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, delayMs]);

  return problems;
}
