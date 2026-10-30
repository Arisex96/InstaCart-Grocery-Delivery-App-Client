// src/hooks/useCheckoutOrder.js — places the order (trimmed from handlePlaceOrder in Checkout.tsx).
//
//   const { placeOrder, submitting, error, orderId } = useCheckoutOrder();
//   await placeOrder({ address, slot })   -> POST /orders with the cart total; clears the cart on success
//
// Reported: duplicate orders on slow connections, and a button that stays on "Placing order…"
// forever after a server error.
import { useState } from "react";
import api from "../api/axios";
import useCartStore from "../store/useCartStore";

export default function useCheckoutOrder() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total_price);
  const clear_cart = useCartStore((state) => state.clear_cart);

  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const placeOrder = async ({ address, slot }) => {
    setSubmitting(true);
    const { data } = await api.post("/orders", {
      address,
      slot,
      total,
      items: items.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
    });
    clear_cart();
    setOrderId(data.orderId);
    setSubmitting(false);
  };

  return { placeOrder, submitting, orderId };
}
