// src/lib/productForm.js — validation and payload building for the admin product form
// (the real form builds its payload in handleSubmit of client/src/pages/admin/AdminProductForm.tsx).
//
// Form shape (what ProductForm keeps in state):
//   { name, description, price, originalPrice, category, unit, stock, isOrganic }
//
// Payload shape sent to api.post("/products", payload):
//   { name, description, price, originalPrice, image, category, unit, stock, isOrganic, rating: 5, reviewCount: 0 }
export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600";

export const EMPTY_FORM = {
  name: "",
  description: "",
  price: 0,
  originalPrice: 0,
  category: "",
  unit: "piece",
  stock: 0,
  isOrganic: false,
};

/** Returns { field: "message" } for every invalid field; {} when the form is valid. */
export function validateProduct(form) {
  const errors = {};
  if (!form.name) errors.name = "Name is required";
  if (!form.category) errors.category = "Pick a category";
  return errors;
}

export function buildProductPayload(form) {
  return {
    name: form.name,
    description: form.description,
    price: Number(form.price),
    originalPrice: Number(form.originalPrice || form.price),
    image: DEFAULT_IMAGE,
    category: form.category,
    unit: form.unit,
    stock: parseInt(form.stock, 10),
    isOrganic: form.isOrganic,
    rating: 5,
    reviewCount: 0,
  };
}
