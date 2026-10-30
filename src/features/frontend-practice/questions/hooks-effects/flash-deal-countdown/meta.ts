import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "flash-deal-countdown",
  title: "Flash deal timer freezes and leaks intervals",
  topic: "hooks-effects",
  difficulty: "medium",
  minutes: 25,
  summary: "useCountdown reads a stale value inside setInterval and never clears its timer.",
  scenario:
    "The Flash Deals page shows \"Deal ends in 0:45\" next to each deal. In production the number drops by one second and then freezes. The performance team also noticed browser timers piling up after shoppers navigate away from the deals page, and a deal that is restarted with a new duration keeps counting from the old value.\n\n" +
    "DealTimer (read-only) formats the time; the bug lives in the useCountdown hook it calls. The tick length is a parameter (default 1000 ms) so the hook can be tested quickly.",
  inspiredBy: ["client/src/pages/FlashDeals.tsx", "client/src/components/ProductCard.tsx"],
  editableFiles: ["src/hooks/useCountdown.js"],
  shared: ["src/data/products.js", "src/store/useCartStore.js", "src/components/ProductCard.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "useCountdown(3, tickMs) returns 3, then 2, 1 and 0 – one step per tick.",
    "It stops at 0: never negative, and no interval keeps running afterwards.",
    "Unmounting the component clears its interval.",
    "Passing a new totalSeconds restarts the countdown from that value.",
    "Exactly one interval is created per run – not one per tick.",
  ],
  reproSteps: [
    "Press Run. The \"Deal ends in\" timer starts at 0:10 and drops to 0:09 – and then stays there.",
    "Click \"Hide timer\" and then \"Show timer\" a few times and watch \"Active interval timers\": the number only grows, timers of hidden components keep running.",
    "Click \"Restart with 20 seconds\": the timer does not start from 0:20.",
  ],
  acceptanceCriteria: [
    "The countdown reaches 0 using one state update per tick, based on the latest value.",
    "Every interval created by the hook is cleared when the component unmounts or the countdown ends.",
    "Changing totalSeconds (or tickMs) restarts the countdown cleanly.",
    "The hook does not create a new interval on every tick.",
  ],
  edgeCases: [
    "totalSeconds is already 0",
    "The component unmounts while the timer is still running",
    "totalSeconds changes while running",
    "Waiting several ticks after reaching 0",
  ],
  hints: [
    "Inside setInterval's callback, which value of `remaining` do you see? When was that callback created?",
    "setRemaining accepts a function that receives the latest value, so the callback does not need to read `remaining` from the closure.",
    "An effect that starts a timer should return a function that stops it. Think about which values should restart the effect: totalSeconds and tickMs.",
  ],
  explanation: {
    rootCause:
      "The effect ran once ([] deps) and its interval callback closed over `remaining` from the first render, so every tick computed `initial - 1` – a stale closure. The interval id was never stored or cleared, so the timer outlived the component (a leak), kept firing after hitting zero, and ignored changes to totalSeconds.",
    fix: "Use the functional form setRemaining(c => Math.max(0, c - 1)) so each tick builds on the latest value, return a cleanup that calls clearInterval, only run the interval while there is time left, and reset the state when totalSeconds changes.",
    takeaways: [
      "Callbacks created in an effect capture the values of that render; prefer functional state updates inside timers.",
      "Every setInterval/addEventListener in an effect needs a matching cleanup.",
      "Put the inputs that should restart the work (totalSeconds, tickMs) in the dependency array.",
    ],
  },
  expectedFailures: ["counts down", "never goes negative", "clears its interval", "restarts from the new value"],
});
