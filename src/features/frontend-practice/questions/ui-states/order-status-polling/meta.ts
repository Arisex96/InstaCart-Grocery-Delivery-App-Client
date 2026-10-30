import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "order-status-polling",
  title: "Order tracking flickers, never stops polling and loses the order on errors",
  topic: "ui-states",
  difficulty: "hard",
  minutes: 45,
  summary: "A polling order-status card must handle loading, error with retry, empty, success and background refreshes properly.",
  scenario:
    "The order tracking screen refreshes the order status every few seconds (like OrderTracking.tsx). Support collected these complaints: \"the whole card turns into grey boxes every few seconds\", \"after my order was delivered the app keeps hitting the server\", \"when my connection dropped for a moment the order vanished and I got an error page\", and \"on the error page there is nothing to tap\". The ops dashboard also shows requests continuing long after people leave the page.\n\n" +
    "Fix useOrderStatus (the polling hook) and OrderStatusCard (the states). The card must distinguish: first load (skeleton), first load failed (error + Try again), order not found (empty), success, a background refresh (small \"Updating…\" hint, no skeleton), and a failed refresh (keep the last order, show a retry banner).",
  inspiredBy: ["client/src/pages/OrderTracking.tsx", "client/src/pages/MyOrders.tsx", "client/src/components/Loading.tsx"],
  editableFiles: ["src/hooks/useOrderStatus.js", "src/components/OrderStatusCard.jsx"],
  shared: [],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "First load: a skeleton (role status, \"Loading order\"). Afterwards the skeleton never comes back during polling.",
    "First load failed: \"Couldn't load your order\" with a Try again button; the hook does not keep hammering the server.",
    "fetcher resolving null: \"We couldn't find this order\" and polling stops.",
    "Refresh failed while an order is shown: the order stays visible, a banner says \"Couldn't refresh the status\" with Retry, and polling continues.",
    "Polling stops when the status is Delivered or Cancelled, and when the component unmounts.",
  ],
  reproSteps: [
    "Press Run and watch the card: every 3 seconds it turns into the grey skeleton and back.",
    "Wait until the status reaches Delivered: the \"API requests so far\" counter under the card keeps growing.",
    "Click \"Fail next refresh\": the order disappears and an error replaces the card, without a retry button.",
    "Click \"Look up a missing order\": nothing is rendered at all.",
  ],
  acceptanceCriteria: [
    "loading is true only until the first response; background polls set refreshing instead.",
    "Polling uses a cleaned-up timer: no requests after unmount or after a terminal status.",
    "An error never discards an order that is already shown.",
    "Each state (loading, error, empty, success, refreshing, refresh-failed) renders distinct UI with accessible roles.",
  ],
  edgeCases: [
    "Unmounting while a request is in flight",
    "A refresh error followed by a good refresh (banner disappears)",
    "Retry after the very first load failed",
    "An order that is already Delivered on first load",
  ],
  hints: [
    "Which state variable drives the skeleton, and when does the poll set it? A refresh and a first load are different things.",
    "setInterval keeps running until you clear it. Return a cleanup function from the effect, and decide when the loop should end (a flag inside the effect is enough).",
    "Catching an error does not mean clearing the data: set error, leave order alone. Only decide what to render from BOTH values.",
    "A recursive setTimeout (schedule the next poll when the previous one finished) avoids overlapping requests and is easy to stop.",
  ],
  explanation: {
    rootCause:
      "The hook flipped `loading` to true on every poll (so the UI replaced the data with a skeleton), threw away the order in its catch block, never cleared its setInterval (so polling survived unmounts and delivered orders) and offered no way to retry. The component only distinguished loading from not-loading, so error and empty looked like a blank page.",
    fix: "Track first load (`loading`) and background refresh (`refreshing`) separately, keep the last order when a refresh fails, drive polling with an effect-local timer that stops when cancelled, when the status is terminal or when nothing was found, and expose retry. The card renders each state explicitly from order / loading / refreshing / error.",
    takeaways: [
      "Model UI states explicitly instead of one boolean: first load, refresh, error with data, error without data, empty.",
      "Never let a transient error destroy data the user already has.",
      "Every timer started in an effect needs a way to stop: cleanup, terminal conditions, cancellation flag.",
    ],
  },
  expectedFailures: ["skeleton again", "terminal status", "unmounted", "refresh fails", "Try again", "not found"],
});
