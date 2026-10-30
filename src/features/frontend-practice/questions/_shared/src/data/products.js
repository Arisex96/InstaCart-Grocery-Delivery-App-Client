// Sample catalogue for the practice lab (client shape, like src/types Product).
// None of this is real store data. Images are inline SVG data URIs because the
// sandbox has no network access.

const emoji = (symbol, bg = "#faf7f2") =>
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="' +
      bg +
      '"/><text x="50" y="68" font-size="54" text-anchor="middle">' +
      symbol +
      "</text></svg>",
  );

export const categories = [
  { slug: "fruits-vegetables", name: "Fruits & Vegetables" },
  { slug: "dairy-eggs", name: "Dairy & Eggs" },
  { slug: "bakery", name: "Bakery" },
  { slug: "beverages", name: "Beverages" },
  { slug: "snacks", name: "Snacks" },
  { slug: "pantry-staples", name: "Pantry Staples" },
];

export const products = [
  { _id: "p1", name: "Organic Bananas", description: "Sweet ripe bananas", price: 1.2, originalPrice: 1.2, image: emoji("🍌"), category: "fruits-vegetables", unit: "1 lb", stock: 40, isOrganic: true, rating: 4.7, reviewCount: 212, discount: 0 },
  { _id: "p2", name: "Whole Milk", description: "Fresh whole milk, 1 gallon", price: 3.5, originalPrice: 4.4, image: emoji("🥛"), category: "dairy-eggs", unit: "1 gal", stock: 3, isOrganic: false, rating: 4.5, reviewCount: 98, discount: 20 },
  { _id: "p3", name: "Hass Avocados", description: "Creamy avocados", price: 2.0, originalPrice: 2.0, image: emoji("🥑"), category: "fruits-vegetables", unit: "each", stock: 0, isOrganic: true, rating: 4.8, reviewCount: 340, discount: 0 },
  { _id: "p4", name: "Butter Croissant 100g", description: "Flaky butter croissant", price: 2.25, originalPrice: 2.5, image: emoji("🥐"), category: "bakery", unit: "100 g", stock: 12, isOrganic: false, rating: 4.6, reviewCount: 57, discount: 10 },
  { _id: "p5", name: "Sourdough Loaf", description: "Slow-fermented sourdough", price: 5.99, originalPrice: 5.99, image: emoji("🍞"), category: "bakery", unit: "1 loaf", stock: 8, isOrganic: false, rating: 4.9, reviewCount: 410, discount: 0 },
  { _id: "p6", name: "Sparkling Water", description: "Lime sparkling water, 12 pack", price: 4.99, originalPrice: 5.99, image: emoji("🫧"), category: "beverages", unit: "12 pk", stock: 25, isOrganic: false, rating: 4.2, reviewCount: 76, discount: 17 },
  { _id: "p7", name: "Orange Juice", description: "Not-from-concentrate orange juice", price: 4.25, originalPrice: 4.25, image: emoji("🍊"), category: "beverages", unit: "52 oz", stock: 15, isOrganic: false, rating: 4.4, reviewCount: 143, discount: 0 },
  { _id: "p8", name: "Sea Salt Chips", description: "Kettle cooked potato chips", price: 3.0, originalPrice: 3.0, image: emoji("🥔"), category: "snacks", unit: "8 oz", stock: 60, isOrganic: false, rating: 4.1, reviewCount: 64, discount: 0 },
  { _id: "p9", name: "Dark Chocolate Bar", description: "70% cacao dark chocolate", price: 2.7, originalPrice: 3.0, image: emoji("🍫"), category: "snacks", unit: "3.5 oz", stock: 5, isOrganic: true, rating: 4.8, reviewCount: 189, discount: 10 },
  { _id: "p10", name: "Free Range Eggs", description: "Dozen large free range eggs", price: 4.8, originalPrice: 4.8, image: emoji("🥚"), category: "dairy-eggs", unit: "12 ct", stock: 18, isOrganic: true, rating: 4.7, reviewCount: 305, discount: 0 },
  { _id: "p11", name: "Basmati Rice", description: "Long grain basmati rice", price: 8.5, originalPrice: 9.99, image: emoji("🍚"), category: "pantry-staples", unit: "5 lb", stock: 30, isOrganic: false, rating: 4.6, reviewCount: 121, discount: 15 },
  { _id: "p12", name: "Extra Virgin Olive Oil", description: null, price: 11.99, originalPrice: 11.99, image: emoji("🫒"), category: "pantry-staples", unit: "500 ml", stock: 9, isOrganic: false, rating: 4.9, reviewCount: 266, discount: 0 },
];

/** The API sends `id`, not `_id`; the app maps it (see client/src/pages/Products.tsx). */
export const serverProducts = products.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
