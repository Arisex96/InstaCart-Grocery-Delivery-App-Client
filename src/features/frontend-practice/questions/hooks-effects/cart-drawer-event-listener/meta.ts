import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-drawer-event-listener",
  title: "Cart drawer ignores Escape and leaks window listeners",
  topic: "hooks-effects",
  difficulty: "hard",
  minutes: 35,
  summary: "A reusable useEventListener hook captures a stale handler, never removes its listener, and ignores option changes.",
  scenario:
    "The cart drawer is supposed to close on Escape and on a click outside the panel. After it was moved onto a shared useEventListener hook, shoppers report that Escape \"sometimes does nothing\" (the drawer was opened after the page loaded), and the QA profiler shows the number of window keydown/mousedown listeners growing every time the drawer is remounted.\n\n" +
    "CartDrawer (read-only) uses the hook with inline handlers that read the latest props. Fix useEventListener so any component can rely on it: handlers are always the newest ones, listeners are removed when they should be, and the `target` / `enabled` options actually work.",
  inspiredBy: ["client/src/components/CartSideBar.tsx", "client/src/components/Navbar.tsx"],
  editableFiles: ["src/hooks/useEventListener.js"],
  shared: ["src/data/products.js", "src/store/useCartStore.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "useEventListener(type, handler, { target = window, enabled = true }) calls the handler passed in the latest render.",
    "Re-rendering with a new handler function does not remove and re-add the listener.",
    "On unmount, or when type/target changes, the previous listener is really removed (same function reference that was added).",
    "enabled: false attaches nothing; switching it on attaches the listener.",
    "In CartDrawer: Escape and outside mousedown close an open drawer, even if it was opened after the first render.",
  ],
  reproSteps: [
    "Press Run, click \"Open cart\" and press Escape: the drawer stays open (it only closes via the X button).",
    "Click \"Remount drawer\" three times and watch \"Active window listeners\": it grows by 2 each time instead of staying at 2.",
    "Open the drawer and click in the dimmed area outside the panel: nothing happens either when the drawer was opened after a remount.",
  ],
  acceptanceCriteria: [
    "The handler invoked is always the one from the latest render (no stale closures).",
    "No listener is left behind after unmount, a type change, a target change or enabled → false.",
    "A new handler identity alone never re-subscribes the listener.",
    "target can be window or any element, and changing it moves the listener.",
  ],
  edgeCases: [
    "The component renders closed first and opens later",
    "The handler changes on every render",
    "The target element is swapped",
    "enabled starts as false",
  ],
  hints: [
    "Compare the function you pass to addEventListener with the one you pass to removeEventListener. Are they the same object?",
    "The effect depends on [type]. Which other values does it read? But adding `handler` to the dependencies would re-subscribe on every render – is there another way to give the listener access to the newest handler?",
    "A ref can hold \"the latest handler\" while the effect (and its listener) stay stable. Update the ref after every render, and call ref.current from a single stable listener function.",
  ],
  explanation: {
    rootCause:
      "Two bugs in one effect. (1) The listener wraps the handler of the render in which the effect ran ([type] deps), so it keeps calling that first handler – a stale closure; CartDrawer's Escape check read isOpen === false forever. (2) The cleanup calls removeEventListener with a brand-new arrow function, which is a different object than the one added, so nothing is removed and listeners accumulate. The effect also ignores `target` and `enabled`.",
    fix: "Keep the newest handler in a ref that is refreshed after every render. In the subscription effect create ONE named listener that calls ref.current, add it to the target, and remove that same function in the cleanup. Depend on [type, target, enabled] and bail out when `enabled` is false.",
    takeaways: [
      "removeEventListener only works with the exact function reference passed to addEventListener.",
      "The \"latest ref\" pattern lets long-lived subscriptions see fresh props/state without re-subscribing.",
      "Reusable hooks should honour every option they advertise, including changes to them.",
    ],
  },
  expectedFailures: ["latest handler", "removes", "type changes", "target", "enabled", "opened after"],
});
