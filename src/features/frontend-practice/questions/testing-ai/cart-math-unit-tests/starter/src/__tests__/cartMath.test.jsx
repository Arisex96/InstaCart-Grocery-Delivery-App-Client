// src/__tests__/cartMath.test.jsx — YOUR test file.
// Available globals: describe, it, expect, beforeEach. The code under test is
// src/lib/cartMath.js (open its tab to read it).
//
// "Run Tests" runs this file against the real implementation and then against
// several copies of it with a bug planted in each. A good test suite fails on
// every planted bug.
import { subtotal, deliveryFee, orderTotal } from "../lib/cartMath";

const item = (price, quantity = 1) => ({ product: { _id: "x", name: "Item", price }, quantity });

describe("cartMath", () => {
  // A first, very weak test: it passes, but it would also pass for many broken implementations.
  it("returns a positive total for a cart with something in it", () => {
    expect(orderTotal([item(10)]).total).toBeGreaterThan(0);
  });

  // TODO: subtotal() should multiply price by quantity and not drift on cents (0.1 + 0.2)
  // TODO: free delivery starts ABOVE $50 — what happens at exactly $50.00?
  // TODO: discounts: 0%, a normal percentage, and values outside 0..100
  // TODO: what should an empty cart cost?
  // TODO: which amount is the tax calculated on, and which amount decides delivery?
  // TODO: amounts that do not divide evenly into cents
});

// subtotal and deliveryFee are imported for you to use in the TODOs above.
void subtotal;
void deliveryFee;
