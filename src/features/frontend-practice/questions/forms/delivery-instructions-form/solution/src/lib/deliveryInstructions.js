// src/lib/deliveryInstructions.js — rules for the checkout "Delivery instructions" step.
//
// values: { option: "hand" | "door" | "outside", gateCode, meetingSpot, notes }   (all strings)
//
//   "hand"     Hand to me       – no extra field
//   "door"     Leave at door    – shows "Gate code"    (4 to 6 digits)
//   "outside"  Meet outside     – shows "Meeting spot" (any non-empty text)
//
// validateInstructions(values) -> { field: "message" }   (empty object = valid)
// buildPayload(values)         -> the object sent to the server / onSubmit

export const OPTIONS = [
  { id: "hand", label: "Hand to me" },
  { id: "door", label: "Leave at door" },
  { id: "outside", label: "Meet outside" },
];

export const NOTES_LIMIT = 120;

const GATE_CODE = /^\d{4,6}$/;

export const validateInstructions = (values) => {
  const errors = {};

  // ROOT CAUSE (can't submit "Hand to me"): every field was validated, visible or not.
  // FIX: only validate the field that belongs to the selected option.
  if (values.option === "door" && !GATE_CODE.test(values.gateCode.trim())) {
    errors.gateCode = "Enter a gate code of 4 to 6 digits";
  }
  if (values.option === "outside" && !values.meetingSpot.trim()) {
    errors.meetingSpot = "Enter a meeting spot";
  }
  if (values.notes.length > NOTES_LIMIT) errors.notes = "Notes can be at most " + NOTES_LIMIT + " characters";

  return errors;
};

// ROOT CAUSE (gate code leak): the payload always copied all fields, including stale values
// typed under an option the shopper had already left.
// FIX: include only what belongs to the selected option.
export const buildPayload = (values) => {
  const payload = { option: values.option, notes: values.notes.trim() };
  if (values.option === "door") payload.gateCode = values.gateCode.trim();
  if (values.option === "outside") payload.meetingSpot = values.meetingSpot.trim();
  return payload;
};
