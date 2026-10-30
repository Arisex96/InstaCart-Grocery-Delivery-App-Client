import type { Difficulty, Topic } from "./types";

export const TOPICS: Topic[] = [
  { id: "components", label: "Components, props & reusable UI", blurb: "Props, composition and reusable building blocks" },
  { id: "state-updates", label: "State, batching & immutability", blurb: "Updates, re-rendering and immutable data" },
  { id: "hooks-effects", label: "Hooks & effects", blurb: "Dependencies, cleanup, stale closures" },
  { id: "forms", label: "Forms & validation", blurb: "Controlled inputs, validation, submit flow" },
  { id: "ui-states", label: "Loading, error & empty states", blurb: "Every state the UI can be in" },
  { id: "lists", label: "Lists, filters & pagination", blurb: "Keys, filtering, sorting, paging" },
  { id: "api-races", label: "API integration & races", blurb: "Stale responses, errors, optimistic updates" },
  { id: "architecture", label: "Architecture & performance", blurb: "Composition, memoization, re-render control" },
  { id: "testing-ai", label: "Testing & AI-assisted dev", blurb: "Tests that catch bugs; reviewing generated code" },
];

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

export const topicLabel = (id: string) => TOPICS.find((t) => t.id === id)?.label ?? id;
