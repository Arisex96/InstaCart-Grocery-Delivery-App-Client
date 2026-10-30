import { applyCoupons } from "./src/lib/coupons";

// Cart helpers: a cart of one product at the given unit price.
const cart = (price, quantity = 1) => [{ product: { _id: "p", name: "Item", price }, quantity }];
const coupon = (code, type, value, extra = {}) => ({ code, type, value, stackable: false, ...extra });

const NOW = new Date("2025-01-15T12:00:00.000Z");

describe("applyCoupons", () => {
  it("does not mutate or reorder the coupons passed in", () => {
    const coupons = [
      coupon("SAVE5", "fixed", 5, { stackable: true }),
      coupon("TEN", "percent", 10, { stackable: true }),
      coupon("BIG20", "percent", 20),
    ];
    const before = coupons.map((c) => c.code);
    applyCoupons(cart(100), coupons, NOW);
    expect(coupons.map((c) => c.code)).toEqual(before);
  });

  it("takes fixed discounts off first, then percentages from what is left", () => {
    // Listed percent-first and with the percent coupon being worth more, on purpose.
    const coupons = [coupon("TEN", "percent", 10), coupon("SAVE5", "fixed", 5, { stackable: true })];
    const result = applyCoupons(cart(100), coupons, NOW);
    // 100 - 5 = 95, then 10% of 95 = 9.50
    expect(result.discounts).toEqual([
      { code: "SAVE5", amount: 5 },
      { code: "TEN", amount: 9.5 },
    ]);
    expect(result.total).toBe(85.5);
  });

  it("keeps a coupon valid at its exact expiry instant and drops it afterwards", () => {
    const coupons = [
      coupon("EXPIRING", "percent", 30, { expiresAt: "2025-01-15T12:00:00.000Z" }),
      coupon("BIG20", "percent", 20),
    ];
    const atExpiry = applyCoupons(cart(100), coupons, new Date("2025-01-15T12:00:00.000Z"));
    expect(atExpiry.discounts.map((d) => d.code)).toEqual(["EXPIRING"]);
    expect(atExpiry.total).toBe(70);

    const afterExpiry = applyCoupons(cart(100), coupons, new Date("2025-01-15T12:00:00.001Z"));
    expect(afterExpiry.discounts.map((d) => d.code)).toEqual(["BIG20"]);
    expect(afterExpiry.total).toBe(80);
  });

  it("uses only the best non-stackable coupon and respects minSubtotal", () => {
    const coupons = [
      coupon("FLAT8", "fixed", 8),
      coupon("BIG20", "percent", 20),
      coupon("MIN150", "percent", 50, { minSubtotal: 150 }),
    ];
    const result = applyCoupons(cart(100), coupons, NOW);
    expect(result.discounts).toEqual([{ code: "BIG20", amount: 20 }]);
    expect(result.total).toBe(80);
  });

  it("works when only stackable coupons are present", () => {
    const result = applyCoupons(cart(100), [coupon("SAVE5", "fixed", 5, { stackable: true })], NOW);
    expect(result.discounts).toEqual([{ code: "SAVE5", amount: 5 }]);
    expect(result.total).toBe(95);
  });

  it("rounds every discount to whole cents", () => {
    const result = applyCoupons(cart(33.33), [coupon("TEN", "percent", 10)], NOW);
    expect(result.discounts).toEqual([{ code: "TEN", amount: 3.33 }]); // 3.333 -> 3.33
    expect(result.total).toBe(30);
  });

  it("never discounts more than the cart is worth", () => {
    const result = applyCoupons(cart(4), [coupon("SAVE5", "fixed", 5)], NOW);
    expect(result.discounts).toEqual([{ code: "SAVE5", amount: 4 }]);
    expect(result.total).toBe(0);
  });

  it("returns zero totals and no discounts for an empty cart", () => {
    const result = applyCoupons([], [coupon("TEN", "percent", 10)], NOW);
    expect(result).toEqual({ subtotal: 0, discounts: [], total: 0 });
  });
});
