// src/components/DeliverySlotPicker.jsx — the "When should we deliver?" step of checkout
// (the delivery section of client/src/pages/Checkout.tsx).
//
// Props
//   days      [{ id, label, slots: [{ id, label, full }] }]
//   value     { dayId, slotId } | null        the selected slot (owned by the parent)
//   onChange  ({ dayId, slotId }) => void
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders it with a few
// schedules, and the Target UI output tab shows the finished picker.

const DeliverySlotPicker = ({ days, value, onChange }) => {
  // TODO: which day is being viewed? (local state; starts at value?.dayId ?? days[0].id)
  // TODO: day tabs (role="tablist" / role="tab" / aria-selected).
  // TODO: radio group "Delivery time" with a real radio per slot of the viewed day.
  // TODO: full slots -> disabled radio + a "Full" badge inside the label.
  // TODO: role="status" line: "Selected: <day>, <slot>" or "Pick a delivery slot".
  void days;
  void value;
  void onChange;

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h3 className="font-serif text-lg text-app-green">Delivery time</h3>
      <p className="mt-2 text-sm text-app-text-light">Day tabs and slots go here.</p>
    </section>
  );
};

export default DeliverySlotPicker;
