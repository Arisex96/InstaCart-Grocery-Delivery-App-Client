// src/components/CheckoutWizard.jsx — the checkout split into three steps
// (modelled on the stepper in client/src/pages/Checkout.tsx).
import { useState } from "react";
import useCartStore from "../store/useCartStore";
import useCheckoutOrder from "../hooks/useCheckoutOrder";
import AddressStep from "./steps/AddressStep";
import SlotStep from "./steps/SlotStep";
import ReviewStep from "./steps/ReviewStep";
import { validateAddress, validateSlot } from "../lib/validators";

const STEPS = ["Address", "Delivery", "Review"];

export default function CheckoutWizard() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total_price);
  const { placeOrder, submitting, error, orderId } = useCheckoutOrder();

  const [step, setStep] = useState(0);
  // The wizard owns the shopper's answers: steps unmount when you leave them.
  const [address, setAddress] = useState({});
  const [slot, setSlot] = useState("");
  const [addressErrors, setAddressErrors] = useState({});
  const [slotError, setSlotError] = useState("");

  if (orderId) {
    return (
      <p role="status" className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">
        Order placed — #{orderId}
      </p>
    );
  }

  // FIX (no validation): the original just did setStep(s => s + 1). Validate the CURRENT step first.
  const next = () => {
    if (step === 0) {
      const errors = validateAddress(address);
      setAddressErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (step === 1) {
      const message = validateSlot(slot);
      setSlotError(message);
      if (message) return;
    }
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => s - 1);

  return (
    <div className="max-w-xl rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-serif text-xl font-bold text-app-green">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </h2>

      {/* FIX (Back loses the address): the original passed initialValues={{}}. AddressStep copies
          initialValues once when it mounts, so hand it what the shopper already typed. */}
      {step === 0 && <AddressStep initialValues={address} onChange={setAddress} errors={addressErrors} />}
      {step === 1 && (
        <SlotStep
          value={slot}
          onChange={(value) => {
            setSlot(value);
            setSlotError("");
          }}
          error={slotError}
        />
      )}
      {step === 2 && <ReviewStep address={address} slot={slot} items={items} total={total} />}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-app-error">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-between">
        {step > 0 ? (
          <button onClick={back} disabled={submitting} className="rounded-full border border-app-border px-5 py-2 text-sm font-semibold">
            Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="rounded-full bg-app-green px-5 py-2 text-sm font-semibold text-white">
            Next
          </button>
        ) : (
          <button
            onClick={() => placeOrder({ address, slot })}
            disabled={submitting}
            className="rounded-full bg-app-orange px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        )}
      </div>
    </div>
  );
}
