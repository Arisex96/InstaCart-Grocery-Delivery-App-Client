import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "filter-accordion-compound",
  title: "Filter accordion ignores its parent and cannot collapse",
  topic: "components",
  difficulty: "hard",
  minutes: 35,
  summary: "A compound Accordion for the Products page filters breaks in controlled mode, never collapses and has no ARIA state.",
  scenario:
    "The Products page filter sidebar (Categories, Price Range) is being rebuilt with a small compound component: <Accordion> owns which section is open, <AccordionItem value> scopes a section, <AccordionTrigger> toggles it and <AccordionPanel> holds the content. It must work uncontrolled (defaultValue) and controlled (value + onValueChange), because the mobile filter drawer wants to open a section from outside, e.g. from a \"Filter by price\" chip.\n\n" +
    "The first version shipped with several problems: clicking an open section does not collapse it, the drawer's chip cannot open a section (the Accordion keeps its own copy of the state), parents are not told about changes when they control the component, screen readers hear nothing about expanded/collapsed, and closed panels are only hidden with CSS.\n\n" +
    "Fix Accordion.jsx. FilterSidebar (read-only) shows how the Products page uses it.",
  inspiredBy: ["client/src/pages/Products.tsx"],
  editableFiles: ["src/components/ui/Accordion.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Uncontrolled: defaultValue opens a section initially; clicking another trigger opens it and closes the previous one; clicking the open trigger collapses it.",
    "Controlled: the open section always equals the `value` prop. Clicking a trigger only calls onValueChange(nextValue) (null when collapsing) and the UI changes when the parent passes a new value.",
    "Triggers expose aria-expanded and aria-controls; the open panel is a region labelled by its trigger; closed panels are not rendered.",
    "Several independent Accordions on one page do not share ids or state.",
  ],
  reproSteps: [
    "Press Run. In the preview, click \"Categories\": it opens. Click it again: it stays open.",
    "Use the buttons above the sidebar (\"Open Price Range\") – the sidebar does not react although the displayed `value` text changes.",
    "Inspect the Console and the page: there is no aria-expanded on the triggers and closed panels are still in the DOM.",
  ],
  acceptanceCriteria: [
    "Clicking the open section's trigger collapses it (value becomes null).",
    "Controlled mode follows the value prop in both directions and reports requested changes through onValueChange.",
    "aria-expanded/aria-controls on triggers; region + aria-labelledby on the open panel; closed panels unmounted.",
    "Uncontrolled mode keeps working, and onValueChange is also called in uncontrolled mode.",
  ],
  edgeCases: [
    "value={null} means controlled with everything closed (not uncontrolled)",
    "switching the controlled value while a section is open",
    "two Accordions rendered side by side",
  ],
  hints: [
    "Ask: who is the source of truth for the open section in each mode? State that is initialised from a prop only reads the prop once.",
    "Treat `value !== undefined` as the controlled signal, compute `current = isControlled ? value : internal`, and only write internal state when uncontrolled.",
    "Put the toggle logic in one function: next = current === itemValue ? null : itemValue. Share it through context together with the current value, and give each item its own context for its value and ids (useId).",
  ],
  explanation: {
    rootCause:
      "The Accordion copied `value ?? defaultValue` into useState once, so later changes to the `value` prop were ignored (broken controlled mode). Selecting always set the new value (never null), so a section could not collapse. onValueChange was wired backwards (only called when uncontrolled), and the triggers/panels carried no ARIA attributes while closed panels were rendered with a CSS class.",
    fix: "Decide controlled vs uncontrolled from `value !== undefined`, derive the current value from props or internal state, funnel every click through a toggle that computes next (null when collapsing), update internal state only when uncontrolled and always call onValueChange. Provide context for the current value and per-item ids, render aria attributes and unmount closed panels.",
    takeaways: [
      "Controlled components never cache a prop in state; they derive from it.",
      "One toggle function, used by every consumer, keeps behaviour consistent across modes.",
      "Compound components share state and ids through context, so consumers stay declarative.",
    ],
  },
  expectedFailures: ["collapses", "controlled", "aria-expanded", "render closed panels"],
});
