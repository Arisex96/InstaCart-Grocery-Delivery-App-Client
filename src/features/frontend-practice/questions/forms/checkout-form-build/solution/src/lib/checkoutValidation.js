// src/lib/checkoutValidation.js — pure validation helpers for the checkout form.
// (The real app validates inline in client/src/pages/Checkout.tsx and Addresses.tsx; this is the
// extracted, testable version.)

const digitsOf = (value) => String(value ?? "").replace(/\D/g, "");

// APPROACH: pure functions with no React in sight. They are trivially unit-testable and the
// component can call them on every render instead of mirroring errors into state.

/**
 * @returns {string} an error message, or "" when the value is valid
 */
export function validateField(name, value) {
  const v = String(value ?? "").trim();
  switch (name) {
    case "name":
      return v ? "" : "Enter your full name";
    case "address":
      return v ? "" : "Enter your street address";
    case "city":
      return v ? "" : "Enter your city";
    case "zip":
      if (!v) return "Enter your ZIP code";
      return /^\d{5}$/.test(v) ? "" : "ZIP code must be 5 digits";
    case "phone":
      if (!v) return "Enter your phone number";
      return digitsOf(v).length === 10 ? "" : "Enter a valid phone number";
    case "cardNumber":
      if (!v) return "Enter your card number";
      // Spaces are allowed as separators, any other character is invalid.
      return /^[\d\s]+$/.test(v) && digitsOf(v).length === 16 ? "" : "Card number must be 16 digits";
    default:
      return "";
  }
}

/**
 * @returns {Record<string, string>} only the failing fields -> message
 */
export function validateForm(values) {
  const fields = ["name", "address", "city", "zip", "phone"];
  // A hidden card field must never block a cash order.
  if (values.payment === "card") fields.push("cardNumber");

  const errors = {};
  for (const field of fields) {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}
