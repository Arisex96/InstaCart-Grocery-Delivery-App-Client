export type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";

export interface ConsoleEntry {
  level: ConsoleLevel;
  /** Already formatted (objects are stringified inside the sandbox). */
  text: string;
  /** Where it came from: the live preview / Run, or a test run. */
  source: "preview" | "tests";
}

/** Formats console arguments inside the sandbox; safe for cycles and huge values. */
export function formatArg(value: unknown, depth = 0, seen = new WeakSet<object>()): string {
  if (typeof value === "string") return depth === 0 ? value : JSON.stringify(value);
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "function") return `ƒ ${value.name || "(anonymous)"}()`;
  if (typeof value === "symbol" || typeof value === "bigint") return String(value);
  if (typeof value !== "object") return String(value);
  if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
  if (typeof Node !== "undefined" && value instanceof Node) {
    return (value as Element).outerHTML?.slice(0, 200) ?? String(value);
  }
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (depth > 3) return Array.isArray(value) ? "[Array]" : "[Object]";
  if (Array.isArray(value)) {
    const items = value.slice(0, 50).map((v) => formatArg(v, depth + 1, seen));
    return `[${items.join(", ")}${value.length > 50 ? ", …" : ""}]`;
  }
  if (value instanceof Map) return `Map(${value.size}) ${formatArg([...value], depth + 1, seen)}`;
  if (value instanceof Set) return `Set(${value.size}) ${formatArg([...value], depth + 1, seen)}`;
  const entries = Object.entries(value as object)
    .slice(0, 50)
    .map(([k, v]) => `${k}: ${formatArg(v, depth + 1, seen)}`);
  const text = `{ ${entries.join(", ")} }`;
  return text.length > 2000 ? text.slice(0, 2000) + "…" : text;
}

export const formatArgs = (args: unknown[]) => args.map((a) => formatArg(a)).join(" ");
