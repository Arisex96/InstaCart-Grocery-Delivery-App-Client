// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The cart is pre-filled and the fake server takes 900 ms to answer /orders, so double clicks
// are easy to make. The counter under the wizard counts POST /orders requests that were sent.
// Tick the box to make the NEXT order fail with a 500.
import { useEffect, useState } from "react";
import CheckoutWizard from "./components/CheckoutWizard";
import useCartStore from "./store/useCartStore";
import api from "./api/axios";
import { products } from "./data/products";

api.__configure({ latency: 900 });

export default function Demo() {
  const [sent, setSent] = useState(0);

  useEffect(() => {
    const clear = useCartStore.getState().clear_cart;
    clear();
    useCartStore.getState().add_item(products[0], 2);
    useCartStore.getState().add_item(products[3], 1);

    const original = api.post;
    api.post = (...args) => {
      if (args[0] === "/orders") setSent((n) => n + 1);
      return original(...args);
    };
    return () => {
      api.post = original;
    };
  }, []);

  return (
    <div className="space-y-3">
      <CheckoutWizard />
      <p className="text-xs text-app-text-light">
        POST /orders requests sent: <b data-testid="sent">{sent}</b>
      </p>
      <label className="flex items-center gap-2 text-xs text-app-text-light">
        <input type="checkbox" onChange={(e) => api.__configure({ failNext: e.target.checked ? 1 : 0 })} />
        Make the next order fail
      </label>
    </div>
  );
}
