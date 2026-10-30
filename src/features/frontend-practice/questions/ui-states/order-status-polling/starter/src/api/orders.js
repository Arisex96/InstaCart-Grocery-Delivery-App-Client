// src/api/orders.js — read-only fake order service (the sandbox has no network).
// fetchOrder(orderId) answers after ~400 ms. Each successful call moves the order along:
// Placed -> Packed -> Out for Delivery -> Delivered. The id "missing" resolves to null.
// Demo controls: ordersApi.failNext(n) makes the next n calls reject; requestCount() counts calls.

const TIMELINE = ["Placed", "Packed", "Out for Delivery", "Delivered"];
let served = 0;
let requests = 0;
let failures = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchOrder(orderId) {
  requests += 1;
  await wait(400);
  if (failures > 0) {
    failures -= 1;
    throw new Error("Network Error");
  }
  if (orderId === "missing") return null;
  const status = TIMELINE[Math.min(served, TIMELINE.length - 1)];
  served += 1;
  return {
    id: orderId,
    status,
    eta: status === "Delivered" ? "Delivered" : "Arriving in " + (TIMELINE.length - served) * 10 + " min",
    items: [
      { name: "Organic Bananas", quantity: 2 },
      { name: "Whole Milk", quantity: 1 },
    ],
  };
}

export const ordersApi = {
  failNext(count = 1) {
    failures = count;
  },
  requestCount: () => requests,
  reset() {
    served = 0;
    requests = 0;
    failures = 0;
  },
};
