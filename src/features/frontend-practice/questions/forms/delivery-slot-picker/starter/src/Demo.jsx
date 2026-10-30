// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The parent owns the selected slot (`value`); your picker only reports changes.
import { useState } from "react";
import DeliverySlotPicker from "./components/DeliverySlotPicker";

const slot = (id, label, full = false) => ({ id, label, full });

const NORMAL = [
  { id: "today", label: "Today", slots: [slot("s1", "10 AM–12 PM"), slot("s2", "2–4 PM", true), slot("s3", "6–8 PM")] },
  { id: "tomorrow", label: "Tomorrow", slots: [slot("s1", "8–10 AM"), slot("s2", "2–4 PM"), slot("s3", "6–8 PM", true)] },
  { id: "sat", label: "Sat, 2 Nov", slots: [slot("s1", "10 AM–12 PM"), slot("s2", "12–2 PM")] },
];

const FULL_TODAY = [
  { id: "today", label: "Today", slots: [slot("s1", "10 AM–12 PM", true), slot("s2", "2–4 PM", true)] },
  NORMAL[1],
];

const SCENARIOS = {
  "Normal schedule": { days: NORMAL, initial: null },
  "Preselected slot": { days: NORMAL, initial: { dayId: "tomorrow", slotId: "s2" } },
  "Everything full today": { days: FULL_TODAY, initial: null },
};

function Scenario({ name }) {
  const { days, initial } = SCENARIOS[name];
  const [value, setValue] = useState(initial);
  return (
    <>
      <DeliverySlotPicker days={days} value={value} onChange={setValue} />
      <p className="text-xs text-app-text-light">Parent state: {value ? JSON.stringify(value) : "null"}</p>
    </>
  );
}

export default function Demo() {
  const [name, setName] = useState("Normal schedule");
  return (
    <div className="mx-auto max-w-lg space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.keys(SCENARIOS).map((key) => (
          <button
            key={key}
            onClick={() => setName(key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              key === name ? "border-app-orange bg-app-orange text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      {/* key: a fresh parent state per scenario */}
      <Scenario key={name} name={name} />
    </div>
  );
}
