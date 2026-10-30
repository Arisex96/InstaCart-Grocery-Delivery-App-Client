// src/components/CheckoutWizard.jsx — the checkout split into three steps
// (modelled on the stepper in client/src/pages/Checkout.tsx).
//
//   step 0  Address   (AddressStep)   needs: name, street, city, 5-digit ZIP   -> validateAddress()
//   step 1  Delivery  (SlotStep)      needs: a slot                              -> validateSlot()
//   step 2  Review    (ReviewStep)    "Place order" sends the order
//
// The helpers in src/lib/validators.js are ready to use. Reported by QA: see the exercise text.
import { useState } from "react";
import useCartStore from "../store/useCartStore";
import useCheckoutOrder from "../hooks/useCheckoutOrder";
import AddressStep from "./steps/AddressStep";
import SlotStep from "./steps/SlotStep";
import ReviewStep from "./steps/ReviewStep";

const STEPS = ["Address", "Delivery", "Review"];

export default function CheckoutWizard() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total_price);
  const { placeOrder, submitting, orderId } = useCheckoutOrder();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({});
  const [slot, setSlot] = useState("");

  if (orderId) {
    return (
      <p role="status" className="rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-800">
        Order placed — #{orderId}
      </p>
    );
  }

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  return (
    <div className="max-w-xl rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-serif text-xl font-bold text-app-green">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </h2>

      {step === 0 && <AddressStep initialValues={{}} onChange={setAddress} />}
      {step === 1 && <SlotStep value={slot} onChange={setSlot} />}
      {step === 2 && <ReviewStep address={address} slot={slot} items={items} total={total} />}

      <div className="mt-5 flex justify-between">
        {step > 0 ? (
          <button onClick={back} className="rounded-full border border-app-border px-5 py-2 text-sm font-semibold">
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
            onClick={() => placeOrder({ address, slot }).catch((err) => console.error("Order failed", err))}
            className="rounded-full bg-app-orange px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        )}
      </div>
    </div>
  );
}
