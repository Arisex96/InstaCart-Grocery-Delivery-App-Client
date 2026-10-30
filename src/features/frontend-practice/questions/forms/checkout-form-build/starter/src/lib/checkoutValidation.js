// src/lib/checkoutValidation.js — pure validation helpers for the checkout form.
// (The real app validates inline in client/src/pages/Checkout.tsx and Addresses.tsx; this is the
// extracted, testable version.)
//
// Field names: "name" | "address" | "city" | "zip" | "phone" | "cardNumber"
// The exact error messages are listed in the UI requirements (Problem tab).

/**
 * @param {string} name   field name
 * @param {string} value  raw input value
 * @returns {string} an error message, or "" when the value is valid
 */
export function validateField(name, value) {
  // TODO: trim the value and return the right message for each field.
  void name;
  void value;
  return "";
}

/**
 * @param {{ name, address, city, zip, phone, payment, cardNumber }} values
 * @returns {Record<string, string>} only the failing fields -> message
 *          (cardNumber is validated only when values.payment === "card")
 */
export function validateForm(values) {
  // TODO: run validateField for every field that applies and collect the errors.
  void values;
  return {};
}
