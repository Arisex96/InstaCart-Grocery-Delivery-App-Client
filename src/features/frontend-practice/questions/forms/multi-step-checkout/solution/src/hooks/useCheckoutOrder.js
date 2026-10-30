// src/hooks/useCheckoutOrder.js — places the order (trimmed from handlePlaceOrder in Checkout.tsx).
import { useRef, useState } from "react";
import api from "../api/axios";
import useCartStore from "../store/useCartStore";

export default function useCheckoutOrder() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total_price);
  const clear_cart = useCartStore((state) => state.clear_cart);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // FIX (double submit): `submitting` is React state, which only changes on the NEXT render, so two
  // clicks in the same tick both read `false`. A ref changes synchronously, so it can guard the call.
  const inFlight = useRef(false);

  const placeOrder = async ({ address, slot }) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/orders", {
        address,
        slot,
        total,
        items: items.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
      });
      clear_cart();
      setOrderId(data.orderId);
    } catch (err) {
      // FIX (stuck button + silent failure): the original only reset `submitting` on success, so a
      // rejected request left it true forever and showed nothing. Handle the failure here.
      console.error("Order failed", err);
      setError("Could not place your order. Please try again.");
    } finally {
      // finally runs on success AND failure: the pending flag can never get stuck.
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return { placeOrder, submitting, error, orderId };
}
