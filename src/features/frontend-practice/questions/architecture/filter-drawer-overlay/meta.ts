import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "filter-drawer-overlay",
  title: "Filters drawer closes on every click and leaks key listeners",
  topic: "architecture",
  difficulty: "medium",
  minutes: 30,
  summary: "A reusable drawer closes when you click inside it, listens for Escape while closed and has no dialog semantics.",
  scenario:
    "The mobile \"Filter Options\" drawer in Products.tsx and the cart sidebar share the same overlay structure, so it was extracted into a reusable FilterDrawer. Since then shoppers complain that picking a category inside the drawer closes it, a keyboard user pressing Escape on the page triggers handlers while the drawer is not even open, and the screen reader announces nothing when the drawer appears.\n\n" +
    "Make FilterDrawer a well-behaved controlled overlay: it renders only when open, closes on Escape or a backdrop click (and via its close button) but never from clicks inside the panel, cleans up after itself, and exposes proper dialog semantics.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/components/FilterDrawer.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "When open is false nothing is rendered; when true the drawer shows its title and children.",
    "Escape calls onClose once, but only while the drawer is open.",
    "Clicking the backdrop calls onClose; clicking anywhere inside the panel does not.",
    "The close button calls onClose exactly once.",
    "The panel has role=\"dialog\", aria-modal=\"true\" and is named by its heading (aria-labelledby).",
    "The keydown listener is removed when the drawer closes or unmounts.",
  ],
  reproSteps: [
    "Press Run and click \"Filters\" to open the drawer.",
    "Click a category button inside the panel: the drawer closes (and \"onClose calls\" goes up) although you only selected something.",
    "With the drawer closed, press Escape: \"onClose calls\" still increases.",
  ],
  acceptanceCriteria: [
    "Only the backdrop, the close button and Escape close the drawer.",
    "No document/window listener is left behind after close or unmount.",
    "role=dialog, aria-modal and an accessible name from the heading.",
    "Children are interactive without closing the drawer.",
  ],
  edgeCases: [
    "open toggles repeatedly (listeners must not pile up)",
    "Other keys than Escape are ignored",
    "onClose identity changes between renders",
    "Close button click must not also trigger the backdrop handler",
  ],
  hints: [
    "Where is the onClick that closes the drawer attached? Think about which elements are its ancestors and what happens to a click event as it bubbles.",
    "The Escape listener is registered in an effect. Which two things does that effect need: a dependency list and a cleanup function?",
    "Should anything be listening for keys while `open` is false? Maybe the effect should not even start.",
    "useId() gives you a stable id for aria-labelledby.",
  ],
  explanation: {
    rootCause:
      "The close handler was attached to the outermost wrapper, so every click inside the panel bubbled up to it. The keydown effect had no dependency array and no cleanup: it added a new window listener after every render, never removed any, and did so even while the drawer was closed. The panel was also always mounted and carried no dialog semantics.",
    fix: "Attach onClose to the backdrop element only (siblings, not ancestors, of the panel), return null when closed, register the Escape listener inside an effect that depends on [open, onClose] and removes it in its cleanup, and give the panel role=\"dialog\", aria-modal and aria-labelledby pointing at the heading id.",
    takeaways: [
      "Put click-outside handlers on a backdrop sibling instead of a wrapper that contains the content.",
      "Every addEventListener in an effect needs a matching removeEventListener in the cleanup.",
      "Overlays need dialog semantics, or assistive technology cannot tell what appeared.",
    ],
  },
  expectedFailures: ["inside the panel", "while closed", "removes its keydown listener", "dialog"],
});
