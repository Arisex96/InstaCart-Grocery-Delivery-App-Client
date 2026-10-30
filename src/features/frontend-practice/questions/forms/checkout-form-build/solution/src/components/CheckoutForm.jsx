// src/components/CheckoutForm.jsx — address + payment form of the checkout page
// (real version: client/src/pages/Checkout.tsx, address fields: client/src/pages/Addresses.tsx).
import { useRef, useState } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { validateForm } from "../lib/checkoutValidation";

const INITIAL = { name: "", address: "", city: "", zip: "", phone: "", payment: "cod", cardNumber: "" };
const dollars = (cents) => "$" + (cents / 100).toFixed(2);

const inputClass =
  "w-full rounded-xl border bg-white px-3 py-2 text-sm text-app-text focus:border-app-green aria-[invalid=true]:border-app-error";

/** A labelled input whose error is wired up with aria-invalid + aria-describedby + role=alert. */
const Field = ({ id, label, error, ...input }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-app-text">
      {label}
    </label>
    <input
      id={id}
      className={`${inputClass} ${error ? "border-app-error" : "border-app-border"}`}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      {...input}
    />
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-app-error">
        {error}
      </p>
    )}
  </div>
);

const CheckoutForm = ({ items, placeOrder }) => {
  // APPROACH: keep only what the user typed (values) and what they have interacted with
  // (touched / submitted). Errors are DERIVED from the values on every render, so they can never go stale.
  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | failed
  const [orderId, setOrderId] = useState(null);

  // TRAP: `status` is state, so two submit events in the same tick would both still read "idle".
  // A ref flips synchronously and is the real double-submit guard.
  const inFlight = useRef(false);

  const errors = validateForm(values);
  const shown = (name) => (touched[name] || submitted ? errors[name] : undefined);

  const totalCents = items.reduce((sum, { product, quantity }) => sum + Math.round(product.price * 100) * quantity, 0);
  const unitCount = items.reduce((sum, { quantity }) => sum + quantity, 0);

  const bind = (name) => ({
    value: values[name],
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: values.name.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      zip: values.zip.trim(),
      phone: values.phone.trim(),
      payment: values.payment,
      total: totalCents / 100,
    };
    // The card number is only sent for card payments, and only as digits.
    if (values.payment === "card") payload.cardNumber = values.cardNumber.replace(/\D/g, "");

    inFlight.current = true;
    setStatus("submitting");
    try {
      const result = await placeOrder(payload);
      setOrderId(result?.id);
      setStatus("success");
    } catch {
      setStatus("failed"); // values stay as they are, so the shopper can simply retry
    } finally {
      inFlight.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckIcon className="mx-auto size-8 rounded-full bg-app-success p-1.5 text-white" aria-hidden="true" />
        <p role="status" className="mt-3 font-serif text-xl text-app-green">
          Order placed! #{orderId}
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      aria-label="Checkout"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-app-border bg-white p-5"
    >
      <h2 className="font-serif text-xl text-app-green">Delivery details</h2>

      <Field id="name" label="Full name" autoComplete="name" error={shown("name")} {...bind("name")} />
      <Field id="address" label="Street address" autoComplete="street-address" error={shown("address")} {...bind("address")} />
      <div className="grid grid-cols-2 gap-3">
        <Field id="city" label="City" error={shown("city")} {...bind("city")} />
        <Field id="zip" label="ZIP code" inputMode="numeric" error={shown("zip")} {...bind("zip")} />
      </div>
      <Field id="phone" label="Phone number" type="tel" autoComplete="tel" error={shown("phone")} {...bind("phone")} />

      <fieldset className="rounded-xl border border-app-border p-3">
        <legend className="px-1 text-sm font-semibold text-app-text">Payment method</legend>
        <div className="flex flex-wrap gap-4">
          {[
            ["cod", "Cash on delivery"],
            ["card", "Card"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-app-text">
              <input
                type="radio"
                name="payment"
                value={value}
                checked={values.payment === value}
                onChange={() => setValues((v) => ({ ...v, payment: value }))}
              />
              {label}
            </label>
          ))}
        </div>
        {values.payment === "card" && (
          <div className="mt-3">
            <Field
              id="cardNumber"
              label="Card number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              error={shown("cardNumber")}
              {...bind("cardNumber")}
            />
          </div>
        )}
      </fieldset>

      <dl className="space-y-1 rounded-xl bg-app-cream p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-app-text-light">Items</dt>
          <dd className="font-semibold text-app-text">{unitCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-bold text-app-green">Total</dt>
          <dd className="text-lg font-bold text-app-green">{dollars(totalCents)}</dd>
        </div>
      </dl>

      {status === "failed" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-900">
          Could not place order
          <span className="font-normal"> — your details are still here, please try again.</span>
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-app-orange px-5 py-3 text-sm font-semibold text-white hover:bg-app-orange-dark disabled:opacity-60"
      >
        {submitting && <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />}
        {submitting ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
};

export default CheckoutForm;
