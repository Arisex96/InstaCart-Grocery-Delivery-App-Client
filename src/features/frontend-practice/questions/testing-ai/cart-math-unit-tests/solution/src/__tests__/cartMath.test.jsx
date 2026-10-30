// src/__tests__/cartMath.test.jsx — reference test suite.
// Each test is written to catch one specific class of bug; the comments say which.
import { subtotal, deliveryFee, discountAmount, orderTotal } from "../lib/cartMath";

const item = (price, quantity = 1) => ({ product: { _id: "x", name: "Item", price }, quantity });

describe("subtotal", () => {
  it("multiplies price by quantity and sums the lines", () => {
    expect(subtotal([item(3.5, 2), item(1.25, 1)])).toBe(8.25);
  });

  it("does not drift on floating point cents", () => {
    expect(subtotal([item(0.1, 3)])).toBe(0.3); // 0.1 * 3 === 0.30000000000000004 in JS
  });
});

describe("deliveryFee", () => {
  // Catches a bug in the free-delivery boundary (>= instead of >).
  it("charges $2 at exactly $50.00 and is free above it", () => {
    expect(deliveryFee(50)).toBe(2);
    expect(deliveryFee(50.01)).toBe(0);
    expect(deliveryFee(49.99)).toBe(2);
  });

  // Catches a bug where an empty cart is charged delivery.
  it("charges nothing for an empty cart", () => {
    expect(deliveryFee(0)).toBe(0);
    expect(orderTotal([])).toEqual({ subtotal: 0, discount: 0, delivery: 0, tax: 0, total: 0 });
  });
});

describe("discounts", () => {
  it("takes a percentage off the subtotal", () => {
    expect(discountAmount(100, 20)).toBe(20);
    expect(discountAmount(100, 0)).toBe(0);
  });

  // Catches a missing upper clamp: 150% must not make the order total negative.
  it("never discounts more than the whole cart", () => {
    expect(discountAmount(100, 150)).toBe(100);
    expect(orderTotal([item(100)], 150).total).toBe(0);
  });

  it("ignores a negative percentage", () => {
    expect(discountAmount(100, -10)).toBe(0);
  });
});

describe("orderTotal", () => {
  // Catches tax being computed on the pre-discount subtotal.
  it("charges tax on the discounted subtotal", () => {
    // $100 - 50% = $50 -> delivery $2 (not above 50), tax 18% of 50 = 9
    expect(orderTotal([item(100)], 50)).toEqual({ subtotal: 100, discount: 50, delivery: 2, tax: 9, total: 61 });
  });

  // Catches delivery being decided on the pre-discount subtotal.
  it("decides free delivery after the discount is applied", () => {
    // $60 - 20% = $48 -> below the free-delivery threshold, so $2 delivery
    const result = orderTotal([item(60)], 20);
    expect(result.delivery).toBe(2);
    expect(result.tax).toBe(8.64);
    expect(result.total).toBe(58.64);
  });

  // Catches rounding down (floor) instead of rounding to the nearest cent.
  it("rounds tax to the nearest cent", () => {
    // 18% of 3.33 = 0.5994 -> 0.60 (flooring would give 0.59)
    const result = orderTotal([item(3.33)]);
    expect(result.tax).toBe(0.6);
    expect(result.total).toBe(5.93);
  });

  // Catches the free-delivery boundary again, end to end.
  it("applies the $2 fee to an order of exactly $50", () => {
    expect(orderTotal([item(50)]).total).toBe(61); // 50 + 2 + 9
  });
});
