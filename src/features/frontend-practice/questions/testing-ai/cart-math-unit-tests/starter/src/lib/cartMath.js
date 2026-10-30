// src/lib/cartMath.js — the order maths used by the cart sidebar and the checkout summary.
// It is a pure-function version of the numbers computed in client/src/pages/Checkout.tsx:
//   subtotal ................ sum of price * quantity
//   discount ................ percentage coupon, taken off the subtotal
//   delivery ................ $2.00, free when the (discounted) subtotal is MORE than $50
//   tax ..................... 18% of the discounted subtotal
// Every money value is rounded to whole cents.
//
// This file is read-only: your job is to write the tests for it.

export const FREE_DELIVERY_THRESHOLD = 50;
export const DELIVERY_FEE = 2;
export const TAX_RATE = 0.18;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** items: [{ product: { price }, quantity }] */
export function subtotal(items) {
  return round2(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
}

/** percent is clamped to 0..100 */
export function discountAmount(sub, percent) {
  const p = Math.min(100, Math.max(0, percent));
  return round2((sub * p) / 100);
}

/** No delivery charge for an empty cart; free for orders above the threshold. */
export function deliveryFee(sub) {
  if (sub <= 0) return 0;
  return sub > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function orderTotal(items, discountPercent = 0) {
  const sub = subtotal(items);
  const discount = discountAmount(sub, discountPercent);
  const discounted = round2(sub - discount);
  const delivery = deliveryFee(discounted);
  const tax = round2(discounted * TAX_RATE);
  return { subtotal: sub, discount, delivery, tax, total: round2(discounted + delivery + tax) };
}
