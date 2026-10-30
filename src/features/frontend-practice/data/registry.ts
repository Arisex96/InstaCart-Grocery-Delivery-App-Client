import type { Exercise, ExerciseFile, ExerciseMeta } from "./types";
import { DIFFICULTIES, TOPICS } from "./topics";

/**
 * Exercises are discovered from `questions/<topic>/<id>/`:
 *   meta.ts          ExerciseMeta (default export)
 *   starter/**       the learner's workspace (paths mirror the app: src/components/...)
 *   solution/**      corrected versions of the editable files (others fall back to starter/)
 *   tests.jsx        hidden tests (fix mode); import files as "./src/..."
 * and shared, read-only fixtures in `questions/_shared/**` (`_shared/testing/**`
 * are test-only helpers that are never shown to the learner).
 */
const metas = import.meta.glob<{ default: ExerciseMeta }>("../questions/*/*/meta.ts", { eager: true });
const sources = import.meta.glob<string>("../questions/**/*.{js,jsx}", { eager: true, query: "?raw", import: "default" });
const tests = import.meta.glob<string>("../questions/*/*/tests.jsx", { eager: true, query: "?raw", import: "default" });

const SHARED = "../questions/_shared/";
const shared = new Map<string, string>();
const testSupport: Record<string, string> = {};
const trees = new Map<string, { starter: Map<string, string>; solution: Map<string, string> }>();

for (const [key, source] of Object.entries(sources)) {
  if (key.startsWith(SHARED)) {
    const path = key.slice(SHARED.length);
    if (path.startsWith("testing/")) testSupport[path] = source;
    else shared.set(path, source);
    continue;
  }
  const match = /^\.\.\/questions\/([^/]+)\/([^/]+)\/(starter|solution)\/(.+)$/.exec(key);
  if (!match) continue;
  const [, topic, id, kind, path] = match;
  const treeKey = `${topic}/${id}`;
  if (!trees.has(treeKey)) trees.set(treeKey, { starter: new Map(), solution: new Map() });
  trees.get(treeKey)![kind as "starter" | "solution"].set(path, source);
}

const diffOrder = Object.fromEntries(DIFFICULTIES.map((d, i) => [d.id, i]));
const topicOrder = Object.fromEntries(TOPICS.map((t, i) => [t.id, i]));

function build(): Exercise[] {
  const list: Exercise[] = [];
  for (const [path, mod] of Object.entries(metas)) {
    const meta = mod.default;
    const dir = path.replace(/\/meta\.ts$/, "").replace("../questions/", "");
    const tree = trees.get(dir) ?? { starter: new Map<string, string>(), solution: new Map<string, string>() };
    const files: ExerciseFile[] = [];
    const seen = new Set<string>();

    const add = (filePath: string, starter: string | undefined, editable: boolean) => {
      if (starter === undefined || seen.has(filePath)) return;
      seen.add(filePath);
      files.push({ path: filePath, starter, solution: tree.solution.get(filePath) ?? starter, editable });
    };

    for (const p of meta.editableFiles) add(p, tree.starter.get(p), true);
    for (const p of [...tree.starter.keys()].sort()) add(p, tree.starter.get(p), false);
    for (const p of meta.shared ?? []) add(p, shared.get(p), false);

    list.push({
      ...meta,
      files,
      testCode: tests[`../questions/${dir}/tests.jsx`] ?? "",
      testSupport,
    });
  }
  return list.sort(
    (a, b) =>
      topicOrder[a.topic] - topicOrder[b.topic] ||
      diffOrder[a.difficulty] - diffOrder[b.difficulty] ||
      a.title.localeCompare(b.title),
  );
}

export const EXERCISES: Exercise[] = build();

export const getExercise = (id: string | undefined) => EXERCISES.find((e) => e.id === id);
