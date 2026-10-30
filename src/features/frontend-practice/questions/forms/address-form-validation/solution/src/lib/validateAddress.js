// src/lib/validateAddress.js — validation rules for the address form
// (the real AddressForm in client/src/pages/Addresses.tsx only checks the coordinates on submit).
//
// validateAddress(values) -> { [fieldName]: "message" }   (an empty object means "valid")
//
// `values` holds the raw form state: every field is a string, except `isDefault` (boolean).
// lat / lng are strings from <input type="number"> ("" when left blank).

// FIX: the old version only looked for empty strings, so none of these formats were enforced.
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;

const rangeError = (raw, min, max, name) => {
  if (raw.trim() === "") return undefined; // coordinates are optional
  const value = Number(raw);
  if (Number.isNaN(value) || value < min || value > max) {
    return name + " must be between " + min + " and " + max;
  }
  return undefined;
};

export const validateAddress = (values) => {
  const errors = {};

  if (!values.label.trim()) errors.label = "Label is required";
  if (!values.address.trim()) errors.address = "Street address is required";
  if (!values.city.trim()) errors.city = "City is required";

  if (!values.state.trim()) errors.state = "State is required";
  else if (!STATE_PATTERN.test(values.state.trim())) errors.state = "Use the 2-letter state code";

  if (!values.zip.trim()) errors.zip = "ZIP code is required";
  else if (!ZIP_PATTERN.test(values.zip.trim())) errors.zip = "Enter a valid ZIP code (12345 or 12345-6789)";

  const latError = rangeError(values.lat, -90, 90, "Latitude");
  if (latError) errors.lat = latError;
  const lngError = rangeError(values.lng, -180, 180, "Longitude");
  if (lngError) errors.lng = lngError;

  return errors;
};
