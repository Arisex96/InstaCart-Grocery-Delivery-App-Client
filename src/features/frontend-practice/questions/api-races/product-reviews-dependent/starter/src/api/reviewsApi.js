// src/api/reviewsApi.js — read-only. Stands in for GET /products/:id/reviews (the sandbox has no network).
// list(productId) resolves with [{ id, author, rating, comment }] or rejects when the reviews service is down.
// It is an object so tests (and you, in the console) can replace reviewsApi.list.
const REVIEWS = {
  p1: [
    { id: "r1", author: "Maya", rating: 5, comment: "Perfectly ripe bananas" },
    { id: "r2", author: "Leo", rating: 4, comment: "Good value" },
  ],
  p2: [{ id: "r3", author: "Sam", rating: 5, comment: "Fresh milk, lasted a week" }],
};

const reviewsApi = {
  list(productId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (productId === "p3") return reject(new Error("Reviews service unavailable"));
        resolve(REVIEWS[productId] || []);
      }, productId === "p1" ? 1200 : 150);
    });
  },
};

export default reviewsApi;
