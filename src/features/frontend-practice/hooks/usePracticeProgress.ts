import { useCallback, useEffect, useMemo, useState } from "react";
import type { Exercise } from "../data/types";
import type { WorkspaceFiles } from "../runner/exerciseRunner";

const STORAGE_KEY = "frontend-practice-lab:v2";

interface Persisted {
  /** exerciseId -> path -> contents; only files the learner changed are stored. */
  code: Record<string, Record<string, string>>;
  /** Opened, edited, run or tested — but not necessarily solved. */
  attempted: string[];
  /** Every test passed. Revealing the solution never sets this. */
  solved: string[];
  hints: Record<string, number>;
  solutionRevealed: string[];
}

const empty = (): Persisted => ({ code: {}, attempted: [], solved: [], hints: {}, solutionRevealed: [] });

function load(): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    return { ...empty(), ...(JSON.parse(raw) as Partial<Persisted>) };
  } catch {
    return empty();
  }
}

function save(value: Persisted) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota). The lab still works,
    // edits just won't survive a reload.
  }
}

const add = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

/**
 * Keeps the learner's edits, attempted/solved flags, revealed hints and
 * solution state. Everything is per-exercise (and per-file for code) and
 * independent: showing a hint or the solution never touches the editor.
 */
export function usePracticeProgress(exercises: Exercise[]) {
  const [state, setState] = useState<Persisted>(load);
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  useEffect(() => save(state), [state]);

  /** Contents of every file in the workspace: learner edits over the starters. */
  const getFiles = useCallback(
    (id: string): WorkspaceFiles => {
      const exercise = byId.get(id);
      const edits = state.code[id] ?? {};
      return Object.fromEntries((exercise?.files ?? []).map((f) => [f.path, edits[f.path] ?? f.starter]));
    },
    [byId, state.code],
  );

  const setFile = useCallback(
    (id: string, path: string, content: string) => {
      const starter = byId.get(id)?.files.find((f) => f.path === path)?.starter;
      setState((s) => {
        const edits = { ...(s.code[id] ?? {}) };
        if (content === starter) delete edits[path];
        else edits[path] = content;
        const code = { ...s.code };
        if (Object.keys(edits).length) code[id] = edits;
        else delete code[id];
        return { ...s, code, attempted: content === starter ? s.attempted : add(s.attempted, id) };
      });
    },
    [byId],
  );

  const resetExercise = useCallback((id: string) => {
    setState((s) => {
      const code = { ...s.code };
      delete code[id];
      return { ...s, code };
    });
  }, []);

  const markAttempted = useCallback((id: string) => {
    setState((s) => (s.attempted.includes(id) ? s : { ...s, attempted: [...s.attempted, id] }));
  }, []);

  const markSolved = useCallback((id: string) => {
    setState((s) => ({ ...s, solved: add(s.solved, id), attempted: add(s.attempted, id) }));
  }, []);

  const revealHint = useCallback((id: string, total: number) => {
    setState((s) => ({ ...s, hints: { ...s.hints, [id]: Math.min(total, (s.hints[id] ?? 0) + 1) } }));
  }, []);

  const revealSolution = useCallback((id: string) => {
    setState((s) => ({ ...s, solutionRevealed: add(s.solutionRevealed, id) }));
  }, []);

  return {
    getFiles,
    setFile,
    resetExercise,
    isModified: (id: string) => id in state.code,
    isFileModified: (id: string, path: string) => path in (state.code[id] ?? {}),
    markAttempted,
    isAttempted: (id: string) => state.attempted.includes(id),
    markSolved,
    isSolved: (id: string) => state.solved.includes(id),
    solvedCount: state.solved.length,
    attemptedCount: state.attempted.filter((id) => !state.solved.includes(id)).length,
    hintsShown: (id: string) => state.hints[id] ?? 0,
    revealHint,
    solutionRevealed: (id: string) => state.solutionRevealed.includes(id),
    revealSolution,
  };
}

export type PracticeProgress = ReturnType<typeof usePracticeProgress>;
