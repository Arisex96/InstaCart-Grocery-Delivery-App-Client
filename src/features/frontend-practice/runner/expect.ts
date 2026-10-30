/**
 * A small Jest-flavoured assertion library for the practice lab.
 *
 * It runs both inside the sandbox iframe and in vitest (when the exercises
 * themselves are verified), so it must not depend on either environment.
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

export interface MockFn {
  (...args: unknown[]): unknown;
  mock: { calls: unknown[][]; results: unknown[] };
  mockImplementation(impl: (...args: never[]) => unknown): MockFn;
  mockReturnValue(value: unknown): MockFn;
  mockResolvedValue(value: unknown): MockFn;
  mockRejectedValue(value: unknown): MockFn;
  mockClear(): MockFn;
}

type AnyFn = (...args: never[]) => unknown;

export function fn(impl?: AnyFn): MockFn {
  let current: AnyFn | undefined = impl;
  const mock = (function (this: unknown, ...args: unknown[]) {
    mock.mock.calls.push(args);
    const result = current ? (current as (...a: unknown[]) => unknown).apply(this, args) : undefined;
    mock.mock.results.push(result);
    return result;
  }) as MockFn;
  mock.mock = { calls: [], results: [] };
  mock.mockImplementation = (next) => ((current = next), mock);
  mock.mockReturnValue = (value) => ((current = () => value), mock);
  mock.mockResolvedValue = (value) => ((current = () => Promise.resolve(value)), mock);
  mock.mockRejectedValue = (value) => ((current = () => Promise.reject(value)), mock);
  mock.mockClear = () => {
    mock.mock.calls = [];
    mock.mock.results = [];
    return mock;
  };
  return mock;
}

const isMock = (v: unknown): v is MockFn =>
  typeof v === "function" && "mock" in (v as object) && Array.isArray((v as MockFn).mock?.calls);

const isElement = (v: unknown): v is Element =>
  typeof v === "object" && v !== null && (v as Node).nodeType === 1;

export function format(value: unknown, depth = 0): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "function") return isMock(value) ? "[mock function]" : "[Function]";
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return Object.is(value, -0) ? "-0" : String(value);
  }
  if (isElement(value)) {
    const html = value.outerHTML;
    return html.length > 160 ? html.slice(0, 157) + "..." : html;
  }
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Date) return value.toISOString();
  if (depth > 3) return Array.isArray(value) ? "[Array]" : "[Object]";
  if (Array.isArray(value)) {
    const items = value.slice(0, 10).map((v) => format(v, depth + 1));
    return `[${items.join(", ")}${value.length > 10 ? ", …" : ""}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as object)
      .slice(0, 10)
      .map(([k, v]) => `${k}: ${format(v, depth + 1)}`);
    return `{ ${entries.join(", ")} }`;
  }
  return String(value);
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a instanceof Map && b instanceof Map) {
    return a.size === b.size && [...a].every(([k, v]) => b.has(k) && deepEqual(v, b.get(k)));
  }
  if (a instanceof Set && b instanceof Set) {
    return a.size === b.size && [...a].every((v) => b.has(v));
  }
  // Like Jest's toEqual: properties that are `undefined` are ignored.
  const keys = (o: object) => Object.keys(o).filter((k) => (o as Record<string, unknown>)[k] !== undefined);
  const ka = keys(a);
  const kb = keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

const normalize = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

type Matcher = (received: unknown, ...args: unknown[]) => { pass: boolean; expected: string; negated: string };

function asElement(received: unknown, matcher: string): Element {
  if (!isElement(received)) {
    throw new AssertionError(
      `${matcher} expects a DOM element but received ${format(received)}. ` +
        `Did your query return null? Try the matching queryBy*/findBy* variant.`,
    );
  }
  return received;
}

const matchers = {
  toBe: (r, e) => ({
    pass: Object.is(r, e),
    expected: `Expected ${format(e)} (using ===)\nReceived ${format(r)}`,
    negated: `Expected value not to be ${format(e)}`,
  }),
  toEqual: (r, e) => ({
    pass: deepEqual(r, e),
    expected: `Expected ${format(e)}\nReceived ${format(r)}`,
    negated: `Expected value not to equal ${format(e)}`,
  }),
  toBeTruthy: (r) => ({
    pass: Boolean(r),
    expected: `Expected a truthy value\nReceived ${format(r)}`,
    negated: `Expected a falsy value\nReceived ${format(r)}`,
  }),
  toBeFalsy: (r) => ({
    pass: !r,
    expected: `Expected a falsy value\nReceived ${format(r)}`,
    negated: `Expected a truthy value\nReceived ${format(r)}`,
  }),
  toBeNull: (r) => ({
    pass: r === null,
    expected: `Expected null\nReceived ${format(r)}`,
    negated: "Expected value not to be null",
  }),
  toBeUndefined: (r) => ({
    pass: r === undefined,
    expected: `Expected undefined\nReceived ${format(r)}`,
    negated: "Expected value not to be undefined",
  }),
  toBeDefined: (r) => ({
    pass: r !== undefined,
    expected: "Expected a defined value\nReceived undefined",
    negated: `Expected undefined\nReceived ${format(r)}`,
  }),
  toBeGreaterThan: (r, e) => ({
    pass: (r as number) > (e as number),
    expected: `Expected ${format(r)} to be greater than ${format(e)}`,
    negated: `Expected ${format(r)} not to be greater than ${format(e)}`,
  }),
  toBeGreaterThanOrEqual: (r, e) => ({
    pass: (r as number) >= (e as number),
    expected: `Expected ${format(r)} to be >= ${format(e)}`,
    negated: `Expected ${format(r)} not to be >= ${format(e)}`,
  }),
  toBeLessThan: (r, e) => ({
    pass: (r as number) < (e as number),
    expected: `Expected ${format(r)} to be less than ${format(e)}`,
    negated: `Expected ${format(r)} not to be less than ${format(e)}`,
  }),
  toBeCloseTo: (r, e, digits = 2) => ({
    pass: Math.abs((r as number) - (e as number)) < Math.pow(10, -(digits as number)) / 2,
    expected: `Expected ${format(r)} to be close to ${format(e)}`,
    negated: `Expected ${format(r)} not to be close to ${format(e)}`,
  }),
  toContain: (r, e) => {
    const has =
      typeof r === "string"
        ? r.includes(e as string)
        : Array.isArray(r)
          ? r.some((v) => Object.is(v, e))
          : false;
    return {
      pass: has,
      expected: `Expected ${format(r)} to contain ${format(e)}`,
      negated: `Expected ${format(r)} not to contain ${format(e)}`,
    };
  },
  toHaveLength: (r, e) => {
    const len = (r as { length?: number } | null)?.length;
    return {
      pass: len === e,
      expected: `Expected length ${format(e)}\nReceived length ${format(len)} (${format(r)})`,
      negated: `Expected length not to be ${format(e)}`,
    };
  },
  toMatch: (r, e) => ({
    pass: typeof r === "string" && (e instanceof RegExp ? e.test(r) : r.includes(e as string)),
    expected: `Expected ${format(r)} to match ${String(e)}`,
    negated: `Expected ${format(r)} not to match ${String(e)}`,
  }),
  toHaveProperty: (r, key, ...rest) => {
    const present = r != null && typeof r === "object" && (key as string) in (r as object);
    const value = present ? (r as Record<string, unknown>)[key as string] : undefined;
    const pass = present && (rest.length === 0 || deepEqual(value, rest[0]));
    return {
      pass,
      expected: `Expected property ${format(key)}${rest.length ? ` = ${format(rest[0])}` : ""}\nReceived ${format(r)}`,
      negated: `Expected not to have property ${format(key)}`,
    };
  },
  toThrow: (r, e) => {
    let thrown: unknown;
    let didThrow = false;
    try {
      (r as () => unknown)();
    } catch (err) {
      didThrow = true;
      thrown = err;
    }
    const message = thrown instanceof Error ? thrown.message : String(thrown);
    const matches =
      e === undefined ||
      (e instanceof RegExp ? e.test(message) : typeof e === "string" ? message.includes(e) : true);
    return {
      pass: didThrow && matches,
      expected: didThrow
        ? `Expected error matching ${String(e)}\nReceived error: ${message}`
        : "Expected the function to throw, but it returned normally",
      negated: `Expected the function not to throw, but it threw: ${message}`,
    };
  },

  // ---- mock functions ----
  toHaveBeenCalled: (r) => {
    if (!isMock(r)) throw new AssertionError("toHaveBeenCalled expects a mock function created with fn()");
    return {
      pass: r.mock.calls.length > 0,
      expected: "Expected the function to have been called, but it was never called",
      negated: `Expected the function not to be called, but it was called ${r.mock.calls.length} time(s)`,
    };
  },
  toHaveBeenCalledTimes: (r, n) => {
    if (!isMock(r)) throw new AssertionError("toHaveBeenCalledTimes expects a mock function created with fn()");
    return {
      pass: r.mock.calls.length === n,
      expected: `Expected ${format(n)} call(s)\nReceived ${r.mock.calls.length} call(s)`,
      negated: `Expected the function not to have been called ${format(n)} time(s)`,
    };
  },
  toHaveBeenCalledWith: (r, ...args) => {
    if (!isMock(r)) throw new AssertionError("toHaveBeenCalledWith expects a mock function created with fn()");
    return {
      pass: r.mock.calls.some((c) => deepEqual(c, args)),
      expected: `Expected a call with ${format(args)}\nCalls: ${format(r.mock.calls)}`,
      negated: `Expected no call with ${format(args)}`,
    };
  },
  toHaveBeenLastCalledWith: (r, ...args) => {
    if (!isMock(r)) throw new AssertionError("toHaveBeenLastCalledWith expects a mock function created with fn()");
    const last = r.mock.calls[r.mock.calls.length - 1];
    return {
      pass: last !== undefined && deepEqual(last, args),
      expected: `Expected last call to be ${format(args)}\nReceived ${format(last)}`,
      negated: `Expected last call not to be ${format(args)}`,
    };
  },

  // ---- DOM ----
  toBeInTheDocument: (r) => {
    const present = isElement(r) && r.ownerDocument.contains(r);
    return {
      pass: present,
      expected: "Expected the element to be in the document, but it was not found",
      negated: `Expected the element not to be in the document, but found ${format(r)}`,
    };
  },
  toBeDisabled: (r) => {
    const el = asElement(r, "toBeDisabled");
    const disabled = el.matches(":disabled") || Boolean(el.closest("fieldset:disabled"));
    return {
      pass: disabled,
      expected: `Expected element to be disabled\nReceived ${format(el)}`,
      negated: `Expected element not to be disabled\nReceived ${format(el)}`,
    };
  },
  toBeEnabled: (r) => {
    const el = asElement(r, "toBeEnabled");
    const disabled = el.matches(":disabled") || Boolean(el.closest("fieldset:disabled"));
    return {
      pass: !disabled,
      expected: `Expected element to be enabled\nReceived ${format(el)}`,
      negated: `Expected element to be disabled\nReceived ${format(el)}`,
    };
  },
  toHaveTextContent: (r, e) => {
    const el = asElement(r, "toHaveTextContent");
    const text = normalize(el.textContent);
    const pass = e instanceof RegExp ? e.test(text) : text.includes(normalize(e as string));
    return {
      pass,
      expected: `Expected element text to contain ${format(e)}\nReceived text ${format(text)}`,
      negated: `Expected element text not to contain ${format(e)}\nReceived text ${format(text)}`,
    };
  },
  toHaveValue: (r, e) => {
    const el = asElement(r, "toHaveValue") as HTMLInputElement;
    const value = el.type === "number" && el.value !== "" ? Number(el.value) : el.value;
    return {
      pass: deepEqual(value, e),
      expected: `Expected value ${format(e)}\nReceived ${format(value)}`,
      negated: `Expected value not to be ${format(e)}`,
    };
  },
  toBeChecked: (r) => {
    const el = asElement(r, "toBeChecked") as HTMLInputElement;
    return {
      pass: Boolean(el.checked),
      expected: `Expected element to be checked\nReceived ${format(el)}`,
      negated: `Expected element not to be checked\nReceived ${format(el)}`,
    };
  },
  toHaveAttribute: (r, name, ...rest) => {
    const el = asElement(r, "toHaveAttribute");
    const actual = el.getAttribute(name as string);
    const pass = rest.length ? actual === rest[0] : actual !== null;
    return {
      pass,
      expected: `Expected attribute ${format(name)}${rest.length ? ` = ${format(rest[0])}` : ""}\nReceived ${format(actual)}`,
      negated: `Expected element not to have attribute ${format(name)}${rest.length ? ` = ${format(rest[0])}` : ""}`,
    };
  },
  toHaveClass: (r, ...names) => {
    const el = asElement(r, "toHaveClass");
    return {
      pass: names.every((n) => el.classList.contains(n as string)),
      expected: `Expected element to have class ${names.map(String).join(" ")}\nReceived class "${el.className}"`,
      negated: `Expected element not to have class ${names.map(String).join(" ")}`,
    };
  },
  toHaveFocus: (r) => {
    const el = asElement(r, "toHaveFocus");
    return {
      pass: el.ownerDocument.activeElement === el,
      expected: `Expected element to have focus\nActive element is ${format(el.ownerDocument.activeElement)}`,
      negated: "Expected element not to have focus",
    };
  },
} satisfies Record<string, Matcher>;

type Assertions = { [K in keyof typeof matchers]: (...args: unknown[]) => void };

export interface Expectation extends Assertions {
  not: Assertions;
  resolves: Assertions;
  rejects: Assertions;
}

function build(received: unknown, negate: boolean): Assertions {
  const out: Record<string, (...args: unknown[]) => void> = {};
  for (const [name, matcher] of Object.entries(matchers)) {
    out[name] = (...args: unknown[]) => {
      const { pass, expected, negated } = (matcher as Matcher)(received, ...args);
      if (pass === negate) throw new AssertionError(negate ? negated : expected);
    };
  }
  return out as Assertions;
}

function buildAsync(promise: unknown, negate: boolean, mode: "resolves" | "rejects"): Assertions {
  const out: Record<string, (...args: unknown[]) => Promise<void>> = {};
  for (const name of Object.keys(matchers)) {
    out[name] = async (...args: unknown[]) => {
      let value: unknown;
      try {
        value = await promise;
        if (mode === "rejects") {
          throw new AssertionError(`Expected the promise to reject, but it resolved with ${format(value)}`);
        }
      } catch (err) {
        if (mode === "resolves" || err instanceof AssertionError) throw err;
        value = err;
      }
      (build(value, negate) as Record<string, (...a: unknown[]) => void>)[name](...args);
    };
  }
  return out as unknown as Assertions;
}

export function expect(received: unknown): Expectation {
  return {
    ...build(received, false),
    not: build(received, true),
    resolves: buildAsync(received, false, "resolves"),
    rejects: buildAsync(received, false, "rejects"),
  } as Expectation;
}
