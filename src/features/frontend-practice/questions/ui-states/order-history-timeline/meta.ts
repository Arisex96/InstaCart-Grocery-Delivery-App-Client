import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "order-history-timeline",
  title: "Build the My orders screen with a delivery timeline",
  topic: "ui-states",
  difficulty: "hard",
  kind: "build",
  minutes: 55,
  summary: "Filter tabs with counts, expandable order rows, a delivery stepper and an empty state per filter.",
  scenario:
    "Shoppers want to see their past orders at a glance and drill into one to see what is in it and where it is. Design has delivered the screen: filter tabs (All / Active / Delivered / Cancelled) with counts, one row per order, and an accordion that opens the items plus a delivery progress timeline.\n\n" +
    "The data comes from the orders API (see src/data/orders.js for the shape). Implement the helpers in src/lib/orderUtils.js, the stepper in OrderTimeline.jsx and the screen in OrderHistory.jsx. The Demo has three data scenarios and the Target UI tab shows the finished screen.",
  inspiredBy: ["client/src/pages/MyOrders.tsx", "client/src/pages/OrderTracking.tsx"],
  editableFiles: ["src/components/OrderHistory.jsx", "src/components/OrderTimeline.jsx", "src/lib/orderUtils.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "OrderHistory renders a card with an <h2> \"My orders\" and, below it, a tablist (aria-label \"Filter orders\") with four role=\"tab\" buttons labelled \"All (5)\", \"Active (2)\", \"Delivered (2)\", \"Cancelled (1)\" — the number is the count of orders in that group. The selected tab has aria-selected=\"true\"; \"All\" is selected first. Active means placed, packed or out for delivery.",
    "Each order is one row (an <li>) whose header is a single <button> with aria-expanded. Its text shows, in this order: the order id, the date label, a status badge (\"Placed\", \"Packed\", \"Out for delivery\", \"Delivered\", \"Cancelled\"), the item count (\"3 items\", \"1 item\" — the sum of quantities) and the total as \"$25.18\". Rows keep the order of the data.",
    "Date label: compare calendar days in UTC against the `now` prop. Same day \"Today\", the previous day \"Yesterday\", otherwise \"Mar 5\" (3-letter month + day, no leading zero), and \", 2025\" is appended when the year differs from now's year (\"Dec 30, 2025\").",
    "Rows start collapsed. Activating a row's button expands it (aria-expanded=\"true\") and shows a role=\"region\" labelled \"Order <id> details\"; the region is not in the DOM while collapsed. It is an accordion: opening another row closes the previous one; activating an open row closes it.",
    "The region lists the items in a list labelled \"Items\", each as \"<name> × <quantity>\" with the line total (\"$3.60\") — then the delivery timeline: an ordered list labelled \"Order progress\" with four steps in order: Placed, Packed, Out for delivery, Delivered. The current step has aria-current=\"step\"; every step also contains hidden-but-readable text \"completed\", \"current\" or \"upcoming\" (e.g. with sr-only) so colour is never the only signal. A delivered order has all four steps completed and no current step.",
    "A cancelled order has no timeline: its region shows the text \"Order cancelled\" and no \"Order progress\" list.",
    "Empty states: when the selected tab has no orders show \"No active orders\" / \"No delivered orders\" / \"No cancelled orders\"; when there are no orders at all (tab \"All\") show \"You have no orders yet\". Tabs and counts remain visible.",
  ],
  expectedBehavior: [
    "Everything shown (counts, rows, dates, timeline) is derived from the `orders` and `now` props: passing new props updates the screen.",
    "Money has no floating point noise and always two decimals.",
    "Only one row is open at a time, and switching the filter never leaves a stale open row for an order that is no longer listed.",
  ],
  reproSteps: [
    "Press Run to open the Demo: OrderHistory is only a stub that says it is not built yet.",
    "Open the Target UI tab, click through the tabs, expand a few orders (the out-for-delivery one has a timeline in progress, the cancelled one has none).",
    "Switch the Demo scenario to \"Only delivered\" and \"No orders yet\" to see the empty states, then recreate each behaviour in your build.",
  ],
  acceptanceCriteria: [
    "Helpers: formatOrderDate, countItems, filterOrders, countByFilter and stepStates behave as in the UI requirements (they are tested directly).",
    "Tabs show correct counts and filter the list; the selected tab uses aria-selected.",
    "Rows expose aria-expanded and a labelled region; only one is open at a time.",
    "The timeline marks the current step with aria-current=\"step\" and states completed/current/upcoming in text.",
    "Cancelled orders show \"Order cancelled\"; every empty state has its own message.",
  ],
  edgeCases: [
    "An order at 00:30 UTC on 'today' vs an order 23 hours earlier the previous UTC day (calendar days, not 24h windows)",
    "A date from a previous year",
    "An order with a single unit (\"1 item\") and one with quantities that add up (\"3 items\")",
    "Line totals like 1.2 × 3",
    "Switching to a tab that does not contain the open order",
  ],
  hints: [
    "Put every rule that is not markup in src/lib/orderUtils.js as a pure function; then OrderHistory only has to call them.",
    "For the date label, build UTC midnights with Date.UTC(y, m, d) for both dates and compare the difference in whole days, instead of subtracting raw timestamps.",
    "Keep exactly two pieces of state: the selected filter and the expanded order id (or null). Counts, the visible list and the timeline are derived while rendering.",
    "For the timeline, find the index of the current status in the four steps: earlier steps are completed, that one is current, later ones are upcoming, and delivered/cancelled are special cases.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise, not a bug hunt. The main traps are (1) relative dates computed from timestamps instead of calendar days in a fixed time zone, (2) copying props into state (counts, filtered lists) so the screen goes stale, and (3) conveying progress with colour only instead of text and aria-current.",
    fix: "Write small pure helpers (date label, counts, filter, step states, money in cents). Keep only UI state (selected filter, open order id) in the component and derive everything else per render. Render the row header as one button with aria-expanded and aria-controls, the details as a labelled region, and the timeline as an ordered list with aria-current and hidden state text.",
    takeaways: [
      "Derive, don't duplicate: lists and counts come from props on every render.",
      "Accessible disclosure = button + aria-expanded + labelled region.",
      "Compare calendar days in a fixed zone for 'Today'/'Yesterday'.",
      "Do not rely on colour alone to show progress.",
    ],
  },
  expectedFailures: ["relative date", "filter tabs", "timeline", "empty"],
});
