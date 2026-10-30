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

const AddressForm = ({ addressToEdit = null, onSave, onClose }) => {
  const [formData, setFormData] = useState(() => fromAddress(addressToEdit));
  const [submitting, setSubmitting] = useState(false);
  const errors = validateAddress(formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSave({
        label: formData.label,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        isDefault: formData.isDefault,
        lat: formData.lat,
        lng: formData.lng,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input id={name} name={name} value={formData[name]} onChange={handleChange} className={inputClass} {...props} />
      {errors[name] && <p className="text-xs text-app-error">{errors[name]}</p>}
    </div>
  );

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
