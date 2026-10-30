// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch the starting book to check both states; the last onChange payload is shown below the
// component and logged to the Console tab.
import { useState } from "react";
import AddressBook from "./components/AddressBook";

const WITH_ADDRESSES = [
  { _id: "a1", label: "Home", address: "12 Maple Street", city: "Austin", state: "TX", zip: "78701", isDefault: true },
  { _id: "a2", label: "Office", address: "500 Market Street", city: "San Francisco", state: "CA", zip: "94105", isDefault: false },
  { _id: "a3", label: "Mom", address: "9 Lake Road", city: "Madison", state: "WI", zip: "53703", isDefault: false },
];

const SCENARIOS = { "With addresses": WITH_ADDRESSES, "Empty book": [] };

export default function Demo() {
  const [scenario, setScenario] = useState("With addresses");
  const [last, setLast] = useState(null);

  return (
    <div className="mx-auto max-w-md space-y-3">
      <div className="flex gap-2">
        {Object.keys(SCENARIOS).map((name) => (
          <button
            key={name}
            onClick={() => {
              setScenario(name);
              setLast(null);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              name === scenario ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* key: remount with the chosen starting book */}
      <AddressBook
        key={scenario}
        initialAddresses={SCENARIOS[scenario]}
        onChange={(addresses) => {
          setLast(addresses);
          console.log("onChange", addresses.map((a) => `${a.label}${a.isDefault ? "*" : ""}`).join(", ") || "(empty)");
        }}
      />

      <p className="text-xs text-app-text-light">
        Last onChange: {last ? last.map((a) => `${a.label}${a.isDefault ? " (default)" : ""}`).join(", ") || "empty book" : "none yet"}
      </p>
    </div>
  );
}
