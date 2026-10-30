// src/components/steps/AddressStep.jsx — read-only step form.
//
// It is "semi-controlled": it keeps its own copy of the fields (initialised ONCE from
// `initialValues`, like the AddressForm in Addresses.tsx) and reports every change with
// onChange(allValues). `errors` is { field: message } and is displayed under each input.
import { useState } from "react";

const FIELDS = [
  ["name", "Full name"],
  ["street", "Street address"],
  ["city", "City"],
  ["zip", "ZIP code"],
];

export default function AddressStep({ initialValues = {}, onChange, errors = {} }) {
  const [values, setValues] = useState({ name: "", street: "", city: "", zip: "", ...initialValues });

  const update = (key, value) => {
    const next = { ...values, [key]: value };
    setValues(next);
    onChange(next);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FIELDS.map(([key, label]) => (
        <div key={key} className={key === "street" ? "sm:col-span-2" : ""}>
          <label htmlFor={"addr-" + key} className="mb-1 block text-sm font-medium text-zinc-700">
            {label}
          </label>
          <input
            id={"addr-" + key}
            name={key}
            value={values[key]}
            onChange={(e) => update(key, e.target.value)}
            aria-invalid={Boolean(errors[key])}
            className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
          />
          {errors[key] && (
            <p role="alert" className="mt-1 text-xs text-app-error">
              {errors[key]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
