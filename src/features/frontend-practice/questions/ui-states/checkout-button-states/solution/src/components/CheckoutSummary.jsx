// src/components/CheckoutSummary.jsx — the order summary + "Place order" button from Checkout.tsx.
// Cart lines look like { product: { _id, name, price, stock, … }, quantity } (src/store/useCartStore.js).
// `stock` can drop AFTER an item was added, so a line may exceed it or be sold out (stock 0).
//
// Reported: shoppers can order sold-out items, double-tap the button, and the cart keeps its
// items after a successful order.
import { useState } from "react";
import useCartStore from "../store/useCartStore";
import usePlaceOrder from "../hooks/usePlaceOrder";

const CheckoutSummary = () => {
  const items = useCartStore((state) => state.items);
  const total_price = useCartStore((state) => state.total_price);
  const clear_cart = useCartStore((state) => state.clear_cart);
  const { placeOrder, status, error } = usePlaceOrder();
  const [order, setOrder] = useState(null);

  const deliveryFee = total_price > 50 || total_price === 0 ? 0 : 5;
  const total = total_price + deliveryFee;

  // ROOT CAUSE: `disabled` only looked at items.length, so stock problems and an in-flight
  // request never blocked the button. FIX: derive every reason once, reuse it for the
  // disabled flag, the label and the visible messages.
  const isEmpty = items.length === 0;
  const isSubmitting = status === "submitting";
  const problems = items.flatMap(({ product, quantity }) => {
    if (product.stock <= 0) return [`${product.name} is out of stock`];
    if (quantity > product.stock) {
      return [`${product.name}: only ${product.stock} available (you have ${quantity})`];
    }
    return [];
  });
  const canPlaceOrder = !isEmpty && problems.length === 0 && !isSubmitting;

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;
    const result = await placeOrder({
      items: items.map((it) => ({ product: it.product._id, quantity: it.quantity })),
      total,
    });
    if (result) {
      clear_cart(); // FIX: the cart must not survive a successful order
      setOrder(result);
    }
  };

  if (order) {
    return (
      <div className="max-w-md rounded-2xl border border-app-border bg-white p-6 text-center shadow-sm">
        <h2 className="font-serif text-2xl text-app-green">Order placed</h2>
        <p className="mt-2 text-sm text-app-text-light">Your order id is {order.orderId}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md rounded-2xl border border-app-border bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl text-app-green">Order summary</h2>

      {isEmpty && <p className="mt-4 text-sm text-app-text-light">Your cart is empty</p>}

      <ul className="mt-4 divide-y divide-app-cream-dark text-sm">
        {items.map(({ product, quantity }) => (
          <li key={product._id} className="flex justify-between py-2">
            <span>
              {product.name} × {quantity}
            </span>
            <span>${(product.price * quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between text-sm text-app-text-light">
        <span>Delivery</span>
        <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
      </div>

      {problems.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-app-error">
          {problems.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-app-error">
          {error}
        </p>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={!canPlaceOrder}
        className="mt-4 w-full rounded-full bg-app-green py-3 font-semibold text-white shadow-md hover:bg-app-green-light disabled:opacity-50"
      >
        {isSubmitting ? "Placing order…" : `Place order · $${total.toFixed(2)}`}
      </button>
    </div>
  );
};

export default CheckoutSummary;
