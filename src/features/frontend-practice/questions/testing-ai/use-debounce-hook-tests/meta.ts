import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "use-debounce-hook-tests",
  title: "Test the useDebounce hook that powers the navbar search",
  topic: "testing-ai",
  difficulty: "medium",
  mode: "write-tests",
  minutes: 30,
  summary: "Write renderHook tests with real (short) delays that catch bugs planted in a debounce hook.",
  scenario:
    "The navbar search types into a box and uses useDebounce(searchText, 500) so the URL (and the products request) only updates once the shopper pauses. An AI assistant \"cleaned up\" the hook last sprint. Nobody noticed that for a few days the search fired a request for every intermediate word, because the hook had no tests.\n\n" +
    "Write tests for useDebounce with renderHook. Your file is run against the real hook (it must pass) and against copies with one bug planted in each (your suite must fail on every one). Timing tests are tricky: use delays that are long enough to be reliable (100–300 ms) and assert on what happened before AND after the delay.",
  inspiredBy: ["client/src/hooks/useDebounce.ts", "client/src/components/Navbar.tsx"],
  editableFiles: ["src/__tests__/useDebounce.test.jsx"],
  shared: ["src/hooks/useDebounce.js"],
  expectedBehavior: [
    "Your tests pass against the untouched useDebounce.",
    "Every planted bug makes at least one of your tests fail.",
  ],
  reproSteps: [
    "Open src/hooks/useDebounce.js (read-only) and read how the timer and its cleanup work.",
    "Press Run Tests with the starter: the one weak test passes on the real hook, but most seeded bugs are not caught.",
    "Pick an uncaught bug and write the timeline that exposes it: rerender with a new value, wait less than the delay and assert the OLD value, wait longer and assert the NEW one.",
  ],
  acceptanceCriteria: [
    "Use renderHook with initialProps and rerender; wrap waits in act so React flushes state updates.",
    "Assert the intermediate state (still the old value) as well as the final one.",
    "Cover a burst of quick changes, a changed delay, and the initial value.",
    "Every seeded bug is caught; the suite is green on the real hook.",
  ],
  edgeCases: [
    "A second change arrives before the first one has been applied",
    "Only the delay changes (the value stays the same)",
    "The first render (nothing has been debounced yet)",
  ],
  hints: [
    "renderHook(({ value, delay }) => useDebounce(value, delay), { initialProps: { value: 'a', delay: 200 } }) gives you result.current and rerender(newProps).",
    "Real timers: `await act(async () => { await sleep(ms); })` waits and lets React flush. Keep margins wide: a check at 'delay + 30 ms' is flaky, one at 'half the delay' is not.",
    "To catch a missing cleanup, change the value twice with a pause shorter than the delay, then check what the hook returned in between — an intermediate value must never appear.",
  ],
  explanation: {
    rootCause:
      "A test that only checks the initial value cannot fail for any timing bug. The behaviour of a debounce is a timeline: nothing changes before the delay, the latest value wins afterwards, earlier pending updates are cancelled, and a new delay applies to the next timer.",
    fix: "Drive the hook through that timeline with renderHook: rerender, wait less than the delay and assert the old value, wait longer and assert the new value; record every returned value to prove an intermediate one never appears; rerender with only the delay changed.",
    takeaways: [
      "Time-based code is tested by asserting on both sides of the delay.",
      "Record every value a hook returns to prove something never happened.",
      "Use generous margins with real timers instead of tight ones.",
    ],
  },
  mutants: [
    {
      name: "Catches a problem with rapid changes",
      file: "src/hooks/useDebounce.js",
      find: "return () => clearTimeout(timer);",
      replace: "",
      hint: "Change the value twice before the first delay has passed and look at every value the hook returned.",
    },
    {
      name: "Catches a problem when the delay changes",
      file: "src/hooks/useDebounce.js",
      find: "[value, delay]",
      replace: "[value]",
      hint: "Rerender with a long delay and then a short one; the short one should apply.",
    },
    {
      name: "Catches a wrong first value",
      file: "src/hooks/useDebounce.js",
      find: "useState(value)",
      replace: 'useState("")',
      hint: "Check result.current right after the first render.",
    },
    {
      name: "Catches a problem with timing",
      file: "src/hooks/useDebounce.js",
      find: "}, delay);",
      replace: "}, 0);",
      hint: "Right after a change, the old value must still be returned.",
    },
    {
      name: "Catches a value that never updates",
      file: "src/hooks/useDebounce.js",
      find: "setDebouncedValue(value);",
      replace: "setDebouncedValue(debouncedValue);",
      hint: "Wait longer than the delay and assert the new value.",
    },
  ],
  expectedFailures: ["rapid changes", "delay changes", "timing", "never updates"],
});
