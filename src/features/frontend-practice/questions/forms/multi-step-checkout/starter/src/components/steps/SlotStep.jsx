// src/components/steps/SlotStep.jsx — read-only controlled step: value / onChange(slot) / error.
export const SLOTS = ["Today 6–8 pm", "Tomorrow 8–10 am", "Tomorrow 6–8 pm"];

export default function SlotStep({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-zinc-700">Delivery slot</legend>
      <div className="flex flex-col gap-2">
        {SLOTS.map((slot) => (
          <label key={slot} className="flex items-center gap-2 rounded-xl border border-app-border bg-white px-3 py-2 text-sm">
            <input type="radio" name="slot" value={slot} checked={value === slot} onChange={() => onChange(slot)} />
            {slot}
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-app-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
