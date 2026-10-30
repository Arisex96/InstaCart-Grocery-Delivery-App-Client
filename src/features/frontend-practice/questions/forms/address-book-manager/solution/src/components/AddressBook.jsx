// src/components/AddressBook.jsx — the "Saved addresses" screen of the account area
// (client/src/pages/Addresses.tsx is the real, map-based page; this version is list + form only).
//
// Props
//   initialAddresses  [{ _id, label, address, city, state, zip, isDefault }]  (the starting list)
//   onChange(addresses)  called with the whole updated array after every change
import { useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const EMPTY = { label: "", address: "", city: "", state: "", zip: "" };

// APPROACH: validate on submit (not on every keystroke) and return a { field: message } map.
const validate = (values) => {
  const errors = {};
  if (!values.label.trim()) errors.label = "Label is required";
  if (!values.address.trim()) errors.address = "Street address is required";
  if (!values.city.trim()) errors.city = "City is required";
  if (!/^[A-Za-z]{2}$/.test(values.state.trim())) errors.state = "State must be 2 letters";
  if (!/^\d{5}$/.test(values.zip.trim())) errors.zip = "ZIP code must be 5 digits";
  return errors;
};

const FIELDS = [
  ["label", "Label"],
  ["address", "Street address"],
  ["city", "City"],
  ["state", "State"],
  ["zip", "ZIP code"],
];

// APPROACH: the form owns its values and errors. The parent re-creates it with a `key`, so it
// starts empty (or prefilled) every time it opens, with no effect to sync props into state.
function AddressForm({ initial, onSave, onCancel }) {
  const baseId = useId();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault(); // never let the browser reload the page
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return; // nothing is saved while invalid
    onSave({
      label: values.label.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim().toUpperCase(),
      zip: values.zip.trim(),
    });
  };

  return (
    <form
      aria-label="Address form"
      onSubmit={handleSubmit}
      noValidate
      className="mt-4 space-y-3 rounded-xl border border-app-border bg-app-cream p-4"
    >
      {FIELDS.map(([name, label]) => {
        const id = `${baseId}-${name}`;
        const error = errors[name];
        return (
          <div key={name}>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-app-text">
              {label}
            </label>
            <input
              id={id}
              value={values[name]}
              onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className={`w-full rounded-xl border bg-white px-3 py-2 text-sm ${error ? "border-app-error" : "border-app-border"}`}
            />
            {error && (
              <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-app-error">
                {error}
              </p>
            )}
          </div>
        );
      })}
      <div className="flex gap-2">
        <button type="submit" className="rounded-full bg-app-green px-4 py-2 text-sm font-semibold text-white hover:bg-app-green-light">
          Save address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-app-border bg-white px-4 py-2 text-sm font-medium text-app-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const AddressBook = ({ initialAddresses = [], onChange }) => {
  const [addresses, setAddresses] = useState(initialAddresses);
  // editing: null (form closed) | { id: null } (new address) | { id } (editing that address)
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const nextId = useRef(1);

  // APPROACH: every change goes through one helper, so onChange can never be forgotten.
  const commit = (next) => {
    setAddresses(next);
    onChange?.(next);
  };

  const save = (values) => {
    if (editing?.id) {
      // Edit in place: the default flag stays whatever it was.
      commit(addresses.map((a) => (a._id === editing.id ? { ...a, ...values } : a)));
    } else {
      // The first address saved into an empty book becomes the default.
      commit([...addresses, { ...values, _id: `new-${nextId.current++}`, isDefault: addresses.length === 0 }]);
    }
    setEditing(null);
  };

  const remove = (id) => {
    const removed = addresses.find((a) => a._id === id);
    let next = addresses.filter((a) => a._id !== id);
    // Invariant: exactly one default. Deleting the default promotes the first remaining one.
    if (removed?.isDefault) next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
    setConfirmingId(null);
    commit(next);
  };

  // Recomputing the whole array is the simplest way to keep exactly one default.
  const makeDefault = (id) => commit(addresses.map((a) => ({ ...a, isDefault: a._id === id })));

  const editingAddress = editing?.id ? addresses.find((a) => a._id === editing.id) : null;

  return (
    <section aria-label="Saved addresses" className="rounded-2xl border border-app-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-app-green">Saved addresses</h2>
        <button
          onClick={() => setEditing({ id: null })}
          className="rounded-full bg-app-green px-4 py-2 text-sm font-semibold text-white hover:bg-app-green-light"
        >
          Add address
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className="mt-4 text-sm text-app-text-light">No saved addresses</p>
      ) : (
        <ul aria-label="Addresses" className="mt-4 space-y-3">
          {addresses.map((a) => (
            <li key={a._id} className="rounded-xl border border-app-border p-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-app-orange" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="flex items-center gap-2">
                    <strong className="text-app-text">{a.label}</strong>
                    {a.isDefault && (
                      <span className="rounded-full bg-app-green px-2 py-0.5 text-[10px] font-bold text-white">Default</span>
                    )}
                  </p>
                  <p className="text-app-text-light">{a.address}</p>
                  <p className="text-app-text-light">{`${a.city}, ${a.state} ${a.zip}`}</p>
                </div>
              </div>

              {confirmingId === a._id ? (
                <div role="group" aria-label={`Confirm delete ${a.label}`} className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm">
                  <span className="text-red-900">Delete this address?</span>
                  <button onClick={() => remove(a._id)} className="rounded-full bg-app-error px-3 py-1 text-xs font-semibold text-white">
                    Yes
                  </button>
                  <button onClick={() => setConfirmingId(null)} className="rounded-full border border-app-border bg-white px-3 py-1 text-xs">
                    No
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button
                    aria-label={`Edit ${a.label}`}
                    onClick={() => setEditing({ id: a._id })}
                    className="rounded-full border border-app-border px-3 py-1 hover:bg-app-cream"
                  >
                    Edit
                  </button>
                  <button
                    aria-label={`Delete ${a.label}`}
                    onClick={() => setConfirmingId(a._id)}
                    className="rounded-full border border-app-border px-3 py-1 text-app-error hover:bg-red-50"
                  >
                    Delete
                  </button>
                  {!a.isDefault && (
                    <button
                      aria-label={`Set ${a.label} as default`}
                      onClick={() => makeDefault(a._id)}
                      className="rounded-full border border-app-border px-3 py-1 hover:bg-app-cream"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <AddressForm
          key={editing.id ?? "new"}
          initial={editingAddress ? { ...EMPTY, ...editingAddress } : EMPTY}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </section>
  );
};

export default AddressBook;
