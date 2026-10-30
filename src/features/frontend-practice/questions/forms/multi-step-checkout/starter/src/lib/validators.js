// src/lib/validators.js — read-only. Pure validation helpers (same idea as the checks in Addresses.tsx).
// Both return the problems found; an empty result means "valid".

/** @returns {{ name?: string, street?: string, city?: string, zip?: string }} */
export function validateAddress(values = {}) {
  const errors = {};
  if (!values.name || !values.name.trim()) errors.name = "Enter your full name";
  if (!values.street || !values.street.trim()) errors.street = "Enter your street address";
  if (!values.city || !values.city.trim()) errors.city = "Enter your city";
  if (!/^\d{5}$/.test((values.zip || "").trim())) errors.zip = "Enter a 5-digit ZIP code";
  return errors;
}

/** @returns {string} an error message, or "" when a slot is chosen */
export function validateSlot(slot) {
  return slot ? "" : "Choose a delivery slot";
}
