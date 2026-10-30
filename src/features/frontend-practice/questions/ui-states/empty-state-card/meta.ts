import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "empty-state-card",
  title: "Build a reusable EmptyState and its three wrappers",
  topic: "ui-states",
  difficulty: "easy",
  kind: "build",
  minutes: 25,
  summary: "One EmptyState component for empty cart, no search results and no orders.",
  scenario:
    "The app shows an \"empty\" message in several places (an empty cart, a search without results, an account without orders) and each one was copy-pasted with slightly different markup. Design wants a single reusable EmptyState and three thin wrappers with the exact approved copy.\n\n" +
    "Build EmptyState in src/components/EmptyState.jsx and EmptyCart, NoResults and NoOrders in src/components/emptyStates.jsx. The Demo switches between the four situations, and the Target UI tab shows the finished design.",
  inspiredBy: ["client/src/components/ProductGrid.tsx", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/components/EmptyState.jsx", "src/components/emptyStates.jsx"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "EmptyState renders one container with role=\"status\" in the style of the No Products Found card: dashed gray border, rounded-3xl, centered column, generous vertical padding (py-12).",
    "Inside, in this order: an icon slot (the `icon` prop, wrapped in an aria-hidden element), an <h3> with `title` (serif font), a <p> with `description`, then the actions.",
    "The primary action is a <button> labelled `actionLabel` that calls onAction; the secondary action is a link-style <button> (underlined text, no background) labelled `secondaryLabel` that calls onSecondary. A button is only rendered when its label is provided.",
    "EmptyCart({ onContinue }): shopping cart icon, title \"Your cart is empty\", description \"Looks like you haven't added anything yet. Fresh groceries are a click away.\", primary \"Continue shopping\".",
    "NoResults({ query, onClear }): search icon; title `No results for \"<query>\"` (query trimmed), or \"No products found\" when the query is missing or blank; description \"Try a different spelling, or clear your filters to see everything.\"; primary \"Clear filters\" only when onClear is given.",
    "NoOrders({ onBrowse, onSupport }): inbox icon, title \"No orders yet\", description \"When you place an order it will show up here so you can track it.\", primary \"Start shopping\" (onBrowse), secondary \"Need help?\" only when onSupport is given.",
  ],
  expectedBehavior: [
    "Every wrapper is just EmptyState with the right props: no duplicated markup.",
    "Buttons only exist when they can do something, and each click calls its callback exactly once.",
  ],
  reproSteps: [
    "Press Run and switch between the four Demo tabs: the stub shows nothing useful.",
    "Open the Target UI tab to compare the finished cards.",
    "In the Demo's \"No results\" tab type a query (with extra spaces, then clear it) to check the title rules.",
  ],
  acceptanceCriteria: [
    "EmptyState exposes role=status, an h3 title, the description and the optional buttons.",
    "The three wrappers use the exact copy from the spec and the right icons.",
    "Optional buttons are omitted when their label or callback is not provided, and callbacks fire once per click.",
  ],
  edgeCases: ["query is undefined, empty or only spaces", "no onClear / onSupport callbacks", "actionLabel without secondaryLabel", "icon omitted"],
  hints: [
    "Build EmptyState first and keep it dumb: it only lays out whatever props it receives.",
    "Wrappers can be tiny functions that return <EmptyState icon={...} title={...} ... />. Compute the NoResults title from query?.trim().",
    "Render each button with a condition on its label (and callback) so absent actions leave no empty element behind.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise. The trap is copy-pasting markup per situation instead of composing a reusable component, and forgetting the edge cases of the optional pieces.",
    fix: "Make EmptyState a presentational component with icon/title/description/actions props, render optional buttons conditionally, and express each situation as a small wrapper that only supplies copy and callbacks.",
    takeaways: [
      "Compose reusable UI from small, prop-driven components; wrappers carry the copy.",
      "Optional UI should be omitted, not rendered empty.",
      "role=status announces state changes like an empty result politely to screen readers.",
    ],
  },
  expectedFailures: ["status region", "EmptyCart", "NoResults"],
});
