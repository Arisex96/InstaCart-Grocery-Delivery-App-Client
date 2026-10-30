// src/__tests__/useDebounce.test.jsx — YOUR test file.
// Available: describe, it, expect, beforeEach, fn, sleep, plus Testing Library:
//   renderHook, act, waitFor  from "@testing-library/react"
// The hook under test is src/hooks/useDebounce.js (open its tab).
//
// "Run Tests" runs this file against the real hook and then against copies with one
// bug planted in each. Make every planted bug fail at least one test.
import { renderHook, act } from "@testing-library/react";
import useDebounce from "../hooks/useDebounce";

// Waits with real timers and lets React flush the state updates that happen meanwhile.
const wait = (ms) =>
  act(async () => {
    await sleep(ms);
  });

const setup = (value = "a", delay = 200) =>
  renderHook(({ value, delay }) => useDebounce(value, delay), { initialProps: { value, delay } });

describe("useDebounce", () => {
  // Weak starter test: it passes, but says nothing about the timing behaviour.
  it("returns the initial value", () => {
    const { result } = setup("milk");
    expect(result.current).toBe("milk");
  });

  // TODO: after rerender with a new value the OLD value is still returned until `delay` has passed
  // TODO: after the delay the NEW value is returned
  // TODO: a burst of quick changes only applies the last one (no intermediate value ever appears)
  // TODO: when only the delay changes, the new delay applies
});

void wait;
