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

export const validateInstructions = (values) => {
  const errors = {};

  if (!values.gateCode.trim()) errors.gateCode = "Enter a gate code of 4 to 6 digits";
  if (!values.meetingSpot.trim()) errors.meetingSpot = "Enter a meeting spot";
  if (values.notes.length > NOTES_LIMIT) errors.notes = "Notes can be at most " + NOTES_LIMIT + " characters";

  return errors;
};

export const buildPayload = (values) => ({
  option: values.option,
  gateCode: values.gateCode.trim(),
  meetingSpot: values.meetingSpot.trim(),
  notes: values.notes.trim(),
});
