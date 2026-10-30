// src/components/DeliveryInstructionsForm.jsx — the "Delivery instructions" step of checkout
// (see client/src/pages/Checkout.tsx for the surrounding steps).
//
// Props
//   onSubmit(payload)  async; resolves when the instructions were saved, rejects on failure
//
// Reported: gate codes sent with hand-delivered orders, impossible to submit "Hand to me",
// errors that are not announced to screen readers, duplicate submissions.
import { useState } from "react";
import { OPTIONS, buildPayload, validateInstructions } from "../lib/deliveryInstructions";

const inputClass = "w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm";

const DeliveryInstructionsForm = ({ onSubmit }) => {
  const [values, setValues] = useState({ option: "hand", gateCode: "", meetingSpot: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const setField = (name) => (e) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // FIX (stale dependent state): changing the option resets the dependent values and the
  // errors that belonged to the previous option.
  const handleOptionChange = (e) => {
    const option = e.target.value;
    setValues((prev) => ({ ...prev, option, gateCode: "", meetingSpot: "" }));
    setErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // FIX (duplicate submits): `disabled` only takes effect after React re-renders.
    if (submitting) return;

    const found = validateInstructions(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(buildPayload(values));
    } catch (error) {
      console.error(error);
      setFormError("We could not save your instructions. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // FIX (accessibility): connect an input to its error message and announce the message.
  const errorProps = (name) => ({
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? name + "-error" : undefined,
  });
  const errorMessage = (name) =>
    errors[name] && (
      <p id={name + "-error"} role="alert" className="text-xs text-app-error">
        {errors[name]}
      </p>
    );

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Delivery instructions"
      className="flex max-w-md flex-col gap-4 rounded-2xl border border-app-border bg-white p-5"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-serif text-xl font-bold text-app-green">How should we deliver?</legend>
        {OPTIONS.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="option"
              value={option.id}
              checked={values.option === option.id}
              onChange={handleOptionChange}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      {values.option === "door" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="gate-code" className="text-sm font-medium text-zinc-700">
            Gate code
          </label>
          <input
            id="gate-code"
            value={values.gateCode}
            onChange={setField("gateCode")}
            className={inputClass}
            {...errorProps("gateCode")}
          />
          {errorMessage("gateCode")}
        </div>
      )}

      {values.option === "outside" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="meeting-spot" className="text-sm font-medium text-zinc-700">
            Meeting spot
          </label>
          <input
            id="meeting-spot"
            value={values.meetingSpot}
            onChange={setField("meetingSpot")}
            className={inputClass}
            {...errorProps("meetingSpot")}
          />
          {errorMessage("meetingSpot")}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
          Notes for the driver
        </label>
        <textarea
          id="notes"
          rows={2}
          value={values.notes}
          onChange={setField("notes")}
          className={inputClass}
          {...errorProps("notes")}
        />
        {errorMessage("notes")}
      </div>

      {formError && <p className="rounded-lg bg-red-50 p-2 text-sm text-app-error">{formError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-app-green py-2.5 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save instructions"}
      </button>
    </form>
  );
};

export default DeliveryInstructionsForm;
