export type Difficulty = "easy" | "medium" | "hard";

export type TopicId =
  | "components"
  | "state-updates"
  | "hooks-effects"
  | "forms"
  | "ui-states"
  | "lists"
  | "api-races"
  | "architecture"
  | "testing-ai";

export interface Topic {
  id: TopicId;
  label: string;
  blurb: string;
}

export interface Mutant {
  /** Shown to the learner, e.g. "Catches a rounding bug". Keep it vague. */
  name: string;
  /** Which subject file the bug is seeded into. */
  file: string;
  /** Exact text in that file to replace… */
  find: string;
  /** …with this buggy version. */
  replace: string;
  /** Extra nudge if the learner's tests don't catch it. */
  hint?: string;
}

/** Hand-written part of an exercise (lives in `questions/<topic>/<id>/meta.ts`). */
export interface ExerciseMeta {
  /** Unique, URL-safe. Must equal the folder name. */
  id: string;
  title: string;
  topic: TopicId;
  difficulty: Difficulty;
  /**
   * `fix` (default): learner edits code, hidden tests.jsx checks it.
   * `write-tests`: learner writes the tests (`editableFiles[0]`); they must pass
   * on the untouched subject files and fail on every entry of `mutants`.
   */
  mode?: "fix" | "write-tests";
  /**
   * `debug` (default): the starter has a bug to find and fix.
   * `build`: the starter is a skeleton; the learner implements a component or
   * feature from `uiSpec` + `acceptanceCriteria` and renders the given data.
   */
  kind?: "debug" | "build";
  /** build only: concrete UI requirements (layout, text formats, states, accessibility contract). */
  uiSpec?: string[];
  /** One-line card summary. */
  summary: string;
  /** Realistic scenario / bug report (plain text, \n\n separates paragraphs). */
  scenario: string;
  /** Real InstaCart files this exercise is modelled on, e.g. "client/src/components/ProductCard.tsx". */
  inspiredBy: string[];
  /**
   * Files the learner may edit, in tab order; the first opens by default.
   * Paths mirror the app (e.g. "src/components/ProductCard.jsx").
   */
  editableFiles: string[];
  /**
   * Shared, read-only fixture modules from `questions/_shared/` to include
   * (e.g. "src/data/products.js"). A file with the same path in the exercise's
   * own `starter/` folder takes precedence.
   */
  shared?: string[];
  /**
   * File whose default export is a demo component rendered by the live preview.
   * Omit for logic-only exercises: Run then just executes the file and shows
   * its console output.
   */
  previewEntry?: string;
  expectedBehavior: string[];
  /** Concrete steps that reproduce the bug in the starter (Run → Preview). */
  reproSteps: string[];
  acceptanceCriteria: string[];
  edgeCases?: string[];
  /** Progressive hints, gentlest first. Must not give the answer away outright. */
  hints: string[];
  explanation: {
    rootCause: string;
    fix: string;
    takeaways?: string[];
  };
  /**
   * Substrings of test names that MUST fail on the starter code. Keeps the
   * test-suite honest: it proves the tests really detect the intended bugs.
   */
  expectedFailures: string[];
  /** write-tests only. */
  mutants?: Mutant[];
  minutes?: number;
}

export interface ExerciseFile {
  /** Path inside the exercise workspace, e.g. "src/components/ProductCard.jsx". */
  path: string;
  starter: string;
  solution: string;
  editable: boolean;
}

/** An exercise as used by the app: metadata + the code files from its folder. */
export interface Exercise extends ExerciseMeta {
  files: ExerciseFile[];
  /** Hidden checks (fix mode). Empty string for write-tests exercises. */
  testCode: string;
  /** Hidden helper modules (render helpers…) available to the tests only. */
  testSupport: Record<string, string>;
}

export const defineExercise = (meta: ExerciseMeta): ExerciseMeta => meta;

export const hasPreview = (e: Pick<Exercise, "previewEntry" | "mode">) => Boolean(e.previewEntry) && e.mode !== "write-tests";

export const TESTS_PATH = "tests.jsx";
