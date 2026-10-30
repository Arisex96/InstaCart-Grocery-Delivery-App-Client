// src/lib/productForm.js — validation and payload building for the admin product form
// (the real form builds its payload in handleSubmit of client/src/pages/admin/AdminProductForm.tsx).
//
// Form shape (what ProductForm keeps in state):
//   { name, description, price, originalPrice, category, unit, stock, isOrganic }
//
// Payload shape sent to api.post("/products", payload):
//   { name, description, price, originalPrice, image, category, unit, stock, isOrganic, rating: 5, reviewCount: 0 }
export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600";

// FIX: numeric fields are stored as the TEXT the admin typed. "" is a legitimate in-progress value;
// the old numeric defaults (0) could never be cleared in a controlled input.
export const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "",
  unit: "piece",
  stock: "",
  isOrganic: false,
};

const isBlank = (text) => String(text).trim() === "";
const roundToCents = (n) => Math.round(n * 100) / 100;

/** Returns { field: "message" } for every invalid field; {} when the form is valid. */
export function validateProduct(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.category) errors.category = "Pick a category";

  // ROOT CAUSE: Number("") is 0 and Number("abc") is NaN, and nothing checked either before saving.
  // FIX: check the text first, then the parsed value.
  const price = Number(form.price);
  if (isBlank(form.price)) {
    errors.price = "Price is required";
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be a positive number";
  }

  if (!isBlank(form.originalPrice)) {
    const original = Number(form.originalPrice);
    if (!Number.isFinite(original) || original <= 0) {
      errors.originalPrice = "Original price must be a positive number";
    } else if (!errors.price && original < price) {
      errors.originalPrice = "Original price can't be lower than price";
    }
  }

  const stock = Number(form.stock);
  if (isBlank(form.stock) || !Number.isInteger(stock) || stock < 0) {
    errors.stock = "Stock must be a whole number (0 or more)";
  }
  return errors;
}

/** Call only with a form that passed validateProduct. */
export function buildProductPayload(form) {
  const price = roundToCents(Number(form.price));
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price,
    // A blank original price means "no discount": it equals the price.
    originalPrice: isBlank(form.originalPrice) ? price : roundToCents(Number(form.originalPrice)),
    image: DEFAULT_IMAGE,
    category: form.category,
    unit: form.unit.trim() || "piece",
    stock: Number(form.stock),
    isOrganic: Boolean(form.isOrganic),
    rating: 5,
    reviewCount: 0,
  };
}
