/**
 * A tiny CommonJS-style module system over an in-memory file map. Exercises are
 * multi-file (src/components/ProductCard.jsx imports ../store/useCartStore, …),
 * so imports between learner files have to resolve like they do in the real app.
 */

export type ModuleMap = Record<string, string>;

export class LoadError extends Error {}

const EXTENSIONS = ["", ".js", ".jsx", "/index.js", "/index.jsx"];

export const dirname = (path: string) => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");

export function normalizePath(path: string): string {
  const out: string[] = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out.join("/");
}

/** Resolves a relative specifier against the importing file, or undefined. */
export function resolveRelative(from: string, specifier: string, files: ModuleMap): string | undefined {
  const base = normalizePath(`${dirname(from)}/${specifier}`);
  return EXTENSIONS.map((ext) => base + ext).find((candidate) => candidate in files);
}

const PASSTHROUGH = new Set(["then", "toJSON", "constructor", "$$typeof", "__esModule"]);

/**
 * Reading an export that does not exist would otherwise surface as a cryptic
 * "Cannot read properties of undefined (reading 'call')". Say what is wrong.
 */
export function guardExports(exports: Record<string, unknown>, path: string) {
  return new Proxy(exports, {
    get(target, key, receiver) {
      if (typeof key === "string" && !(key in target) && !PASSTHROUGH.has(key)) {
        throw new Error(
          `${path} does not export '${key}'. Check the name, and that it is exported (export function … / export default …).`,
        );
      }
      return Reflect.get(target, key, receiver);
    },
  });
}

/**
 * `new Function` puts two header lines before the body; the browser reports
 * stack lines relative to that. `fixStack` strips them so traces point at the
 * learner's source lines (Sucrase keeps line numbers stable).
 */
export const WRAPPER_LINE_OFFSET = 2;

export function evaluateModule(
  path: string,
  code: string,
  require: (id: string) => unknown,
  globals: Record<string, unknown> = {},
): Record<string, unknown> {
  const module = { exports: {} as Record<string, unknown> };
  const names = ["exports", "module", "require", ...Object.keys(globals)];
  try {
    // "use strict" shares line 1 with the code so Sucrase's line numbers survive.
    const factory = new Function(...names, `"use strict";${code}\n//# sourceURL=${path}`);
    factory(module.exports, module, require, ...Object.values(globals));
  } catch (err) {
    if (err instanceof LoadError) throw err;
    const e = err as Error;
    const load = new LoadError(`${path} failed to load: ${e?.name ?? "Error"}: ${e?.message ?? String(err)}`);
    load.stack = e?.stack;
    throw load;
  }
  return module.exports;
}

/**
 * Creates a `require` for the file map. Learner modules are evaluated lazily
 * and cached; bare specifiers come from `externals`.
 */
export function createRequire(files: ModuleMap, externals: Record<string, unknown>) {
  const cache = new Map<string, Record<string, unknown>>();

  const load = (resolved: string): Record<string, unknown> => {
    const hit = cache.get(resolved);
    if (hit) return hit;
    const exports = evaluateModule(resolved, files[resolved], requireFrom(resolved));
    const guarded = guardExports(exports, resolved);
    cache.set(resolved, guarded);
    return guarded;
  };

  function requireFrom(from: string) {
    return (specifier: string): unknown => {
      if (specifier.startsWith(".") || specifier.startsWith("/")) {
        const resolved = resolveRelative(from, specifier, files);
        if (!resolved) {
          throw new LoadError(
            `Cannot find module '${specifier}' imported from ${from}. Files: ${Object.keys(files).join(", ")}`,
          );
        }
        return load(resolved);
      }
      if (specifier in externals) return externals[specifier];
      throw new LoadError(
        `Cannot find module '${specifier}' imported from ${from}. Available packages: ${Object.keys(externals).join(", ")}.`,
      );
    };
  }

  return { requireFrom, load };
}

/** Rewrites "(file.jsx:15:7)" stack positions to the learner's line numbers. */
export function fixStack(stack: string, files: ModuleMap): string {
  return stack.replace(/([\w@./-]+\.jsx?):(\d+):(\d+)/g, (whole, path: string, line: string, col: string) => {
    if (!(path in files)) return whole;
    return `${path}:${Math.max(1, Number(line) - WRAPPER_LINE_OFFSET)}:${col}`;
  });
}
