// src/__tests__/useDebounce.test.jsx — reference tests.
// Each test states which planted bug it exists to catch.
import { renderHook, act } from "@testing-library/react";
import useDebounce from "../hooks/useDebounce";

// Waits with real timers and lets React flush the state updates that happen meanwhile.
const wait = (ms) =>
  act(async () => {
    await sleep(ms);
  });

// Records every value the hook returns, so a test can prove an intermediate value never appeared.
const setup = (value = "a", delay = 200) => {
  const seen = [];
  const hook = renderHook(
    ({ value, delay }) => {
      const debounced = useDebounce(value, delay);
      seen.push(debounced);
      return debounced;
    },
    { initialProps: { value, delay } },
  );
  return { ...hook, seen };
};

describe("useDebounce", () => {
  // Catches: wrong first value (useState("") instead of useState(value)).
  it("returns the initial value on the first render", () => {
    const { result } = setup("milk");
    expect(result.current).toBe("milk");
  });

  // Catches: timer ignoring the delay (0 ms) — the OLD value must survive until the delay passes.
  it("keeps the old value until the delay has passed", async () => {
    const { result, rerender } = setup("a", 200);
    rerender({ value: "b", delay: 200 });
    expect(result.current).toBe("a");
    await wait(60);
    expect(result.current).toBe("a");
  });

  // Catches: a value that never updates (setDebouncedValue(debouncedValue)).
  it("applies the new value once the delay has passed", async () => {
    const { result, rerender } = setup("a", 100);
    rerender({ value: "b", delay: 100 });
    await wait(300);
    expect(result.current).toBe("b");
  });

  // Catches: missing clearTimeout cleanup — the first timer ("x") would still fire at ~200 ms.
  it("only applies the last value of a burst of changes", async () => {
    const { result, rerender, seen } = setup("start", 200);
    rerender({ value: "x", delay: 200 });
    await wait(100); // shorter than the delay
    rerender({ value: "y", delay: 200 });
    await wait(130); // ~230 ms after "x": its timer would have fired without cleanup
    expect(result.current).toBe("start");
    await wait(250);
    expect(result.current).toBe("y");
    expect(seen).not.toContain("x");
  });

  // Catches: effect dependencies without `delay` — the shorter delay would be ignored.
  it("uses the new delay when only the delay changes", async () => {
    const { result, rerender } = setup("a", 200);
    rerender({ value: "b", delay: 2000 }); // starts a 2 s timer
    rerender({ value: "b", delay: 30 }); // same value, shorter delay: must restart with 30 ms
    await wait(150);
    expect(result.current).toBe("b");
  });
});
