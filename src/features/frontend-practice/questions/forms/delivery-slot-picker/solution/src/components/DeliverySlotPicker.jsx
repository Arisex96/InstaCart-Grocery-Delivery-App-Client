// src/components/DeliverySlotPicker.jsx — the "When should we deliver?" step of checkout
// (the delivery section of client/src/pages/Checkout.tsx).
//
// Props
//   days      [{ id, label, slots: [{ id, label, full }] }]
//   value     { dayId, slotId } | null        the selected slot (owned by the parent)
//   onChange  ({ dayId, slotId }) => void
import { useState } from "react";

// APPROACH: only "which day am I looking at" is local state. The selected slot is always read from
// `value`, so the picker cannot disagree with the parent form. Real radio inputs give keyboard
// (arrow keys) and screen reader support for free.
const DeliverySlotPicker = ({ days, value, onChange }) => {
  const [viewedId, setViewedId] = useState(value?.dayId ?? days[0]?.id);
  // If the viewed day disappeared (e.g. the schedule was reloaded) fall back to the first one.
  const viewed = days.find((d) => d.id === viewedId) ?? days[0];

  const selectedDay = days.find((d) => d.id === value?.dayId);
  const selectedSlot = selectedDay?.slots.find((s) => s.id === value?.slotId);

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h3 className="font-serif text-lg text-app-green">Delivery time</h3>

      <div role="tablist" aria-label="Delivery day" className="mt-3 flex gap-2 overflow-x-auto">
        {days.map((day) => {
          const isViewed = day.id === viewed?.id;
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={isViewed}
              onClick={() => setViewedId(day.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                isViewed
                  ? "border-app-green bg-app-green font-semibold text-white"
                  : "border-app-border bg-white text-app-text hover:bg-app-cream"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <div role="radiogroup" aria-label="Delivery time" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {viewed?.slots.map((slot) => {
          const checked = value?.dayId === viewed.id && value?.slotId === slot.id;
          const id = `slot-${viewed.id}-${slot.id}`;
          return (
            <label
              key={slot.id}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                slot.full
                  ? "cursor-not-allowed border-app-border bg-app-cream-dark/50 text-app-text-light"
                  : checked
                    ? "border-app-green bg-app-green/5 font-semibold text-app-green"
                    : "border-app-border hover:bg-app-cream"
              }`}
            >
              <input
                id={id}
                type="radio"
                name="delivery-slot"
                className="accent-[#1b3022]"
                checked={checked}
                disabled={slot.full}
                onChange={() => onChange({ dayId: viewed.id, slotId: slot.id })}
              />
              {slot.label}
              {/* The space matters: inline elements are joined without one in the accessible name. */}
              {slot.full && " "}
              {slot.full && (
                <span className="ml-auto rounded-full bg-app-error/10 px-2 py-0.5 text-[10px] font-bold uppercase text-app-error">
                  Full
                </span>
              )}
            </label>
          );
        })}
      </div>

      <p role="status" className="mt-4 text-sm text-app-text-light">
        {selectedDay && selectedSlot ? (
          <>
            Selected: <span className="font-semibold text-app-green">{selectedDay.label}, {selectedSlot.label}</span>
          </>
        ) : (
          "Pick a delivery slot"
        )}
      </p>
    </section>
  );
};

export default DeliverySlotPicker;
