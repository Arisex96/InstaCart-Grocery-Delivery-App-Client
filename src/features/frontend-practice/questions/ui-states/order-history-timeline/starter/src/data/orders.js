// Sample order history for the practice lab (not real customer data).
// Shape: { id, status, createdAt (ISO, UTC), total, items: [{ name, quantity, price }] }
// status is one of: placed | packed | out_for_delivery | delivered | cancelled

/** The "current time" used by the Demo and the tests: 10 March 2026, 12:00 UTC. */
export const NOW = new Date("2026-03-10T12:00:00Z");

export const orders = [
  {
    id: "IC-1005",
    status: "placed",
    createdAt: "2026-03-10T09:30:00Z",
    total: 25.18,
    items: [
      { name: "Organic Bananas", quantity: 3, price: 1.2 },
      { name: "Free Range Eggs", quantity: 2, price: 4.8 },
      { name: "Sourdough Loaf", quantity: 2, price: 5.99 },
    ],
  },
  {
    id: "IC-1004",
    status: "out_for_delivery",
    createdAt: "2026-03-09T18:00:00Z",
    total: 7.75,
    items: [
      { name: "Whole Milk", quantity: 1, price: 3.5 },
      { name: "Orange Juice", quantity: 1, price: 4.25 },
    ],
  },
  {
    id: "IC-1003",
    status: "delivered",
    createdAt: "2026-03-05T10:00:00Z",
    total: 28.99,
    items: [
      { name: "Basmati Rice", quantity: 2, price: 8.5 },
      { name: "Extra Virgin Olive Oil", quantity: 1, price: 11.99 },
    ],
  },
  {
    id: "IC-1002",
    status: "cancelled",
    createdAt: "2026-03-02T08:00:00Z",
    total: 2.7,
    items: [{ name: "Dark Chocolate Bar", quantity: 1, price: 2.7 }],
  },
  {
    id: "IC-1001",
    status: "delivered",
    createdAt: "2026-02-20T15:00:00Z",
    total: 9.98,
    items: [{ name: "Sparkling Water", quantity: 2, price: 4.99 }],
  },
];
