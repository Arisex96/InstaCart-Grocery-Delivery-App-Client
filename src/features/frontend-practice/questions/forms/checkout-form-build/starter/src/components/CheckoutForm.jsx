// src/components/CheckoutForm.jsx — address + payment form of the checkout page
// (real version: client/src/pages/Checkout.tsx, address fields: client/src/pages/Addresses.tsx).
//
// Props
//   items        [{ product: { price }, quantity }]
//   placeOrder   async (payload) => ({ id })      rejects when the order could not be placed
//
// Build it from the UI requirements in the Problem tab. Validation helpers go in
// src/lib/checkoutValidation.js. The Demo (src/Demo.jsx) renders this form with a fake placeOrder.
import { useState } from "react";
import { validateForm } from "../lib/checkoutValidation";

const INITIAL = { name: "", address: "", city: "", zip: "", phone: "", payment: "cod", cardNumber: "" };

const CheckoutForm = ({ items, placeOrder }) => {
  // TODO 1: values + touched + submitted state; derive the errors from the values (do not store them).
  // TODO 2: labelled inputs, payment radios, the card field only for card payments.
  // TODO 3: order summary (<dl> Items / Total from `items`, money in cents).
  // TODO 4: submit: validate, build the payload, call placeOrder once, handle pending / success / failure.
  const [values] = useState(INITIAL);
  void validateForm;
  void placeOrder;

  return (
    <form aria-label="Checkout" className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl text-app-green">Checkout</h2>
      <p className="mt-2 text-sm text-app-text-light">
        Not built yet ({items.length} lines, payment: {values.payment}).
      </p>
    </form>
  );
};

export default CheckoutForm;
