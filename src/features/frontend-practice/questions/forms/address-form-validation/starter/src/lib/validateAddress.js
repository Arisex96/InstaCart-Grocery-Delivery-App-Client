// src/lib/validateAddress.js — validation rules for the address form
// (the real AddressForm in client/src/pages/Addresses.tsx only checks the coordinates on submit).
//
// validateAddress(values) -> { [fieldName]: "message" }   (an empty object means "valid")
//
// `values` holds the raw form state: every field is a string, except `isDefault` (boolean).
// lat / lng are strings from <input type="number"> ("" when left blank).

export const validateAddress = (values) => {
  const errors = {};

  if (!values.label.trim()) errors.label = "Label is required";
  if (!values.address.trim()) errors.address = "Street address is required";
  if (!values.city.trim()) errors.city = "City is required";
  if (!values.state.trim()) errors.state = "State is required";
  if (!values.zip.trim()) errors.zip = "ZIP code is required";

  return errors;
};
