import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "toast-notification-stack",
  title: "Build a notification stack without a library",
  topic: "state-updates",
  difficulty: "medium",
  kind: "build",
  minutes: 35,
  summary: "A provider and hook that show up to three auto-dismissing notifications.",
  scenario:
    "The app shows toasts through react-hot-toast (see the cart store: \"Added Bananas to cart\"). The team wants a small, dependency-free notification system for the new admin area so every part of the UI can call `notify()` and a stack in the corner shows the messages, newest at the bottom.\n\n" +
    "Implement NotificationProvider and useNotifications in src/components/NotificationProvider.jsx. The Demo has buttons that fire success, error and info notifications, spam five at once and create a sticky one; the Target UI tab shows the finished design.",
  inspiredBy: ["client/src/store/useCartStore.ts", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/components/NotificationProvider.jsx"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "<NotificationProvider defaultDuration={4000} maxVisible={3}> renders its children plus a <div role=\"region\" aria-label=\"Notifications\"> that holds the stack, positioned in the bottom-right corner. defaultDuration (ms) and maxVisible are optional props with those defaults.",
    "useNotifications() returns { notify, dismiss }. notify({ type, message, duration }) returns a unique id; type is \"success\", \"error\" or \"info\" (default \"info\"). dismiss(id) removes that notification.",
    "Each notification is a card inside the region showing its message. Success and info cards have role=\"status\"; error cards have role=\"alert\". Each card has a button with accessible name \"Dismiss notification\" that removes only that card.",
    "A notification disappears by itself after its `duration` ms (falls back to defaultDuration). duration 0 means sticky: it stays until dismissed.",
    "At most maxVisible cards are shown: notifying a fourth drops the oldest, and cards keep the order they were created in (oldest on top).",
    "useNotifications() called outside a NotificationProvider throws an Error whose message mentions NotificationProvider.",
    "No timers may be left running after a notification is dismissed (manually or by overflow) or after the provider unmounts.",
  ],
  expectedBehavior: [
    "notify() can be called from any component under the provider and the card appears immediately.",
    "Dismissing or dropping a notification cancels its auto-dismiss timer, so nothing fires later.",
    "Every notification gets a different id, so dismiss(id) never removes the wrong one.",
  ],
  reproSteps: [
    "Press Run: the skeleton buttons do nothing and no stack is rendered.",
    "Open the Target UI tab, click Success, Error and Info, then Spam 5 to see the oldest cards being dropped.",
    "Click Sticky and watch it stay while the others disappear after their duration.",
  ],
  acceptanceCriteria: [
    "notify shows a card with the right role per type; errors are announced as alerts.",
    "Cards auto-dismiss after their duration, honour defaultDuration, and duration 0 is sticky.",
    "The stack never shows more than maxVisible cards and drops the oldest first.",
    "Manual dismiss and dismiss(id) remove exactly one card; ids are unique.",
    "The hook throws outside the provider; no timers leak after dismiss or unmount.",
  ],
  edgeCases: [
    "five notifications fired in the same event handler",
    "dismissing a card whose timer has not fired yet",
    "duration 0 combined with a short defaultDuration",
    "provider unmounted while notifications are still pending",
    "dismiss(id) for an id that is already gone",
  ],
  hints: [
    "Keep the visible notifications in state as an array of { id, type, message, duration }. A counter in a ref gives unique ids, and `setItems(current => [...current, next].slice(-maxVisible))` keeps only the newest ones even when several notify() calls happen in one event.",
    "Timers are a side effect of the list: an effect that depends on the items can schedule a timeout for each item that has none yet, and clear the timeouts of items that are no longer in the list. Keep the timer ids in a ref (a Map keyed by notification id).",
    "Expose `notify` and `dismiss` through context with useCallback so their identity is stable, add an unmount cleanup effect that clears all timers, and make the hook throw when `useContext` returns null.",
  ],
  explanation: {
    rootCause:
      "There is no bug: this is a build exercise. The main traps are using the stale `items` value when several notifications are fired at once, leaving timers running after dismissal or unmount, and giving two notifications the same id.",
    fix: "Use functional state updates, a ref counter for ids, and an effect that reconciles a Map of timers with the current list (schedule missing ones, clear removed ones). A second effect with an empty dependency list clears every timer on unmount. Context carries stable notify/dismiss callbacks, and the hook throws when used outside the provider.",
    takeaways: [
      "Functional updates (`setState(current => …)`) make several calls in one event safe.",
      "Derive timers from state in an effect instead of managing them in event handlers.",
      "Always clean up timers on removal and unmount.",
    ],
  },
  expectedFailures: ["role", "auto-dismiss", "at most three", "outside"],
});
