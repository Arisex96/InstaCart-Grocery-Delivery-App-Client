// src/data/reviews.js: read-only sample data for the practice lab (not real customer reviews).
// Shape (like client/src/types Review, plus a `helpful` counter):
//   { _id, name, rating (1-5), date (ISO string), comment, helpful }
//
// The array is deliberately NOT in date order, so sorting actually matters.
export const reviews = [
  { _id: "r5", name: "Aisha", rating: 5, date: "2026-02-20T09:00:00Z", comment: "Best bananas I have had from a delivery.", helpful: 3 },
  { _id: "r1", name: "Priya", rating: 5, date: "2026-03-10T08:30:00Z", comment: "Perfectly ripe, arrived early.", helpful: 4 },
  { _id: "r8", name: "Omar", rating: 1, date: "2025-03-01T10:00:00Z", comment: "Arrived bruised.", helpful: 0 },
  { _id: "r3", name: "Lena", rating: 5, date: "2026-03-05T17:45:00Z", comment: "Fresh and well packed.", helpful: 7 },
  { _id: "r2", name: "Marcus", rating: 4, date: "2026-03-09T20:10:00Z", comment: "A little green, great two days later.", helpful: 1 },
  { _id: "r7", name: "Chloe", rating: 4, date: "2025-11-20T12:00:00Z", comment: "Good value for the price.", helpful: 5 },
  { _id: "r4", name: "Tom", rating: 2, date: "2026-03-01T07:20:00Z", comment: "Too many spotty ones in the bunch.", helpful: 0 },
  { _id: "r6", name: "Ben", rating: 3, date: "2026-01-15T14:00:00Z", comment: "Okay, nothing special.", helpful: 2 },
];
