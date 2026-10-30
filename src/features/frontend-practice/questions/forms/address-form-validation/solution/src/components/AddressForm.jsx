// src/components/AddressForm.jsx — simplified AddressForm from client/src/pages/Addresses.tsx.
//
// Props
//   addressToEdit  an existing address to prefill, or null for a new one
//   onSave(data)   async; resolves when the server accepted the address, rejects on failure
//   onClose()      called after a successful save
//
// Field validation lives in src/lib/validateAddress.js.
import { useState } from "react";
import { validateAddress } from "../lib/validateAddress";

const fromAddress = (address) => ({
  label: address?.label ?? "",
  address: address?.address ?? "",
  city: address?.city ?? "",
  state: address?.state ?? "",
  zip: address?.zip ?? "",
  isDefault: address?.isDefault ?? false,
  lat: address?.lat ? String(address.lat) : "",
  lng: address?.lng ? String(address.lng) : "",
});

const inputClass = "w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm";

// Blank coordinates are saved as 0 (like the real form); anything else becomes a number.
const toNumber = (raw) => (raw.trim() === "" ? 0 : Number(raw));

const AddressForm = ({ addressToEdit = null, onSave, onClose }) => {
  const [formData, setFormData] = useState(() => fromAddress(addressToEdit));
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // FIX (errors too early): remember which fields the shopper visited, and whether they tried to submit.
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validation itself is still derived from the data; *showing* it depends on touched/submitted.
  const errors = validateAddress(formData);
  const visibleError = (name) => (touched[name] || submitAttempted ? errors[name] : undefined);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    // ROOT CAUSE (isDefault "on"): a checkbox's `value` is the constant "on". FIX: read `checked`.
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // FIX (double submit): `disabled` alone is not enough (Enter key, programmatic submit).
    if (submitting) return;

    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSaveError(null);
    try {
      await onSave({
        label: formData.label.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        zip: formData.zip.trim(),
        isDefault: formData.isDefault,
        lat: toNumber(formData.lat),
        lng: toNumber(formData.lng),
      });
      onClose();
    } catch (error) {
      console.error(error);
      setSaveError("Could not save address. Please try again.");
    } finally {
      // ROOT CAUSE (stuck button): the flag was only ever set to true. FIX: reset it on every path.
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => {
    const message = visibleError(name);
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={name} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
        <input
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={message ? "true" : undefined}
          className={inputClass}
          {...props}
        />
        {message && <p className="text-xs text-app-error">{message}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Address form" className="flex max-w-md flex-col gap-3 rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl font-bold text-app-green">{addressToEdit ? "Edit address" : "Add address"}</h2>
      {field("label", "Label")}
      {field("address", "Street address")}
      <div className="grid grid-cols-3 gap-3">
        {field("city", "City")}
        {field("state", "State")}
        {field("zip", "ZIP code")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("lat", "Latitude", { type: "number", step: "any" })}
        {field("lng", "Longitude", { type: "number", step: "any" })}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
        Set as default address
      </label>
      {saveError && (
        <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-app-error">
          {saveError}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-app-green py-2.5 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save address"}
      </button>
    </form>
  );
};

export default AddressForm;
