// src/lib/coupons.js
//
// Reviewed and corrected version of the AI-generated code.
//
// Cart items: [{ product: { price }, quantity }]
// Coupon:     { code, type: "percent" | "fixed", value, minSubtotal?, expiresAt?, stackable }
//
// FIX (fractional cents): all maths is done in integer cents and every discount is
// rounded once. Floating point dollars produced amounts such as 3.333.
const toCents = (dollars) => Math.round(dollars * 100);
const toDollars = (cents) => cents / 100;

// How many cents a coupon takes off `baseCents`, never more than what is left.
// FIX (discount larger than the cart): the original fixed coupon returned its full
// value even when the cart was cheaper, which drove the total negative.
const discountCents = (coupon, baseCents) => {
  const raw = coupon.type === "percent" ? Math.round((baseCents * coupon.value) / 100) : toCents(coupon.value);
  return Math.min(raw, baseCents);
};

export function applyCoupons(items, coupons, now = new Date()) {
  const subtotalCents = items.reduce((sum, { product, quantity }) => sum + toCents(product.price) * quantity, 0);

  // FIX (empty cart): nothing to discount, and no coupon (even with minSubtotal 0)
  // should be reported as applied.
  if (subtotalCents === 0) return { subtotal: 0, discounts: [], total: 0 };

  // FIX (expiry boundary): a coupon is still valid AT its expiry instant, so the
  // comparison is <=, not <.
  // ROOT CAUSE of the input mutation lived in the next step of the original code:
  // `coupons.sort(...)` sorted the caller's array in place. We never sort the input.
  const eligible = coupons.filter(
    (c) =>
      (!c.expiresAt || now.getTime() <= new Date(c.expiresAt).getTime()) &&
      subtotalCents >= toCents(c.minSubtotal ?? 0),
  );

  // FIX (reduce on an empty list): the original called reduce() without an initial
  // value, which throws when no non-stackable coupon is eligible. Start from null.
  const best = eligible
    .filter((c) => !c.stackable)
    .reduce((a, b) => (a === null || discountCents(b, subtotalCents) > discountCents(a, subtotalCents) ? b : a), null);
  const chosen = eligible.filter((c) => c.stackable || c === best);

  // FIX (ordering): the spec says fixed discounts come off first, then percentages are
  // taken from what is left. The original applied them in "biggest first" order, so
  // the result depended on coupon size. Copies are made with spread, never sorted in place.
  const ordered = [...chosen.filter((c) => c.type === "fixed"), ...chosen.filter((c) => c.type === "percent")];

  let remaining = subtotalCents;
  const discounts = [];
  for (const coupon of ordered) {
    const amount = discountCents(coupon, remaining);
    if (amount <= 0) continue;
    remaining -= amount;
    discounts.push({ code: coupon.code, amount: toDollars(amount) });
  }

  // FIX (hallucinated API): Math.clamp does not exist, so that line threw a TypeError.
  // It is also unnecessary now: discountCents never takes more than what is left.
  return { subtotal: toDollars(subtotalCents), discounts, total: toDollars(remaining) };
}
