import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "delivery-slot-picker",
  title: "Build the delivery slot picker",
  topic: "forms",
  difficulty: "easy",
  kind: "build",
  minutes: 30,
  summary: "Day tabs plus a radio group of time slots, with full slots disabled and a selection summary.",
  scenario:
    "Checkout needs a \"When should we deliver?\" step. Shoppers first choose a day, then one of that day's time slots. Some slots are already full and must be visible but not selectable. The chosen slot is summarised under the picker so shoppers can double check it before paying.\n\n" +
    "Implement DeliverySlotPicker in src/components/DeliverySlotPicker.jsx. It is a controlled component: the parent owns the selected slot and the picker reports changes. The Demo wires up three delivery schedules and the Target UI tab shows the finished picker.",
  inspiredBy: ["client/src/pages/Checkout.tsx"],
  editableFiles: ["src/components/DeliverySlotPicker.jsx"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A row of day tabs: a container with role=\"tablist\" and one role=\"tab\" button per day (text = day.label). The viewed day has aria-selected=\"true\" and the filled style (bg-app-green text-white). The viewed day starts as value.dayId when there is a value, otherwise the first day, and changes when a tab is clicked.",
    "Below the tabs, the slots of the viewed day as REAL radio inputs inside role=\"radiogroup\" aria-label=\"Delivery time\". Each radio has an associated <label> with the slot label (e.g. \"2–4 PM\"), so its accessible name is the slot label.",
    "A slot with full: true is a disabled radio and its label also shows a small \"Full\" badge (the accessible name becomes \"2–4 PM Full\"). Disabled slots look muted and are never selectable.",
    "A radio is checked only when value equals { dayId, slotId } of the viewed day. Selecting a radio calls onChange({ dayId, slotId }).",
    "Under the picker a role=\"status\" line shows \"Selected: <day label>, <slot label>\" (for example \"Selected: Tomorrow, 2–4 PM\") or \"Pick a delivery slot\" when there is no value. It keeps showing the selection even if the shopper views another day.",
  ],
  expectedBehavior: [
    "The picker is controlled: it only calls onChange and renders what `value` says.",
    "Switching day tabs changes the visible slots but never changes the selection by itself.",
    "A day whose slots are all full still shows its tab, with every slot disabled.",
  ],
  reproSteps: [
    "Press Run: the Demo shows a stub with no tabs.",
    "Open the Target UI tab to see the picker for the \"Normal schedule\" data.",
    "Switch the Demo between \"Normal schedule\", \"Preselected slot\" and \"Everything full today\" to check the states while you build.",
  ],
  acceptanceCriteria: [
    "Day tabs with correct aria-selected, switching changes the slots.",
    "Slots are labelled radios in a group named \"Delivery time\"; full slots are disabled and show \"Full\".",
    "Selecting a slot calls onChange({ dayId, slotId }) and the checked radio follows `value`.",
    "The status line shows the chosen day and slot, or the placeholder.",
  ],
  edgeCases: ["value points to a slot on another day than the viewed one", "all slots of a day are full", "no value", "value with a dayId that no longer exists (fall back to the first day)"],
  hints: [
    "Only the viewed day is local state (useState with value?.dayId ?? days[0].id). The selected slot always comes from props.",
    "Wrap each radio in a <label> (or use htmlFor/id) so the slot text is the accessible name, and put the \"Full\" badge inside the same label. Inline elements are joined without a space in the accessible name, so add one before the badge.",
    "checked={value?.dayId === day.id && value?.slotId === slot.id}; onChange={() => onChange({ dayId: day.id, slotId: slot.id })}. Give all radios the same `name` attribute.",
  ],
  explanation: {
    rootCause: "This is a build exercise, not a bug fix. The main trap is putting the selected slot into local state, which makes the picker go out of sync with the parent form; and forgetting that radios on another day must not look checked.",
    fix: "Keep only the viewed day in local state, render the controlled radios from `value`, and derive the summary from `value` plus the `days` data. Use real <input type=\"radio\"> elements so keyboard and screen reader support comes for free.",
    takeaways: [
      "Controlled form components keep one source of truth in the parent.",
      "Native radios give arrow-key navigation and group semantics without extra code.",
      "disabled + a visible \"Full\" label communicates why a choice is unavailable.",
    ],
  },
  expectedFailures: ["tabs", "radio", "full", "status"],
});
