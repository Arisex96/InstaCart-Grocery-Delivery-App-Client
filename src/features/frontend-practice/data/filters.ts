import type { Difficulty, Exercise, TopicId } from "./types";

export interface Filters {
  topic: TopicId | "all";
  difficulty: Difficulty | "all";
  /** "debug": fix the bug. "build": implement a feature from a UI spec. */
  kind: "all" | "debug" | "build";
}

export const kindOf = (e: Exercise) => e.kind ?? "debug";

export const applyFilters = (exercises: Exercise[], f: Filters) =>
  exercises.filter(
    (e) =>
      (f.topic === "all" || e.topic === f.topic) &&
      (f.difficulty === "all" || e.difficulty === f.difficulty) &&
      (f.kind === "all" || kindOf(e) === f.kind),
  );
