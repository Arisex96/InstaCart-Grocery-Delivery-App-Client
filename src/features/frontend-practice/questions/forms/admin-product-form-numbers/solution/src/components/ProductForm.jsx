// src/components/ProductForm.jsx — trimmed copy of the admin "New Product" form
// (client/src/pages/admin/AdminProductForm.tsx). Validation and the payload live in
// src/lib/productForm.js.
//
// Props: onSubmit(payload) — async; rejects with { response: { data: { message } } } on failure.
// The number fields are text inputs with inputMode="decimal" (what price fields should use).
import { useState } from "react";
import { categories } from "../data/products";
import { EMPTY_FORM, buildProductPayload, validateProduct } from "../lib/productForm";

const inputClass = "w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm";

const ProductForm = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // FIX: state keeps exactly what the admin typed (a string). The old code converted while typing
  // (Number(e.target.value)), so "" became 0 and a controlled input could never be emptied.
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // ROOT CAUSE (bad data saved): the form always called onSubmit, even with invalid fields.
    const found = validateProduct(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaveError("");
    setSaving(true);
    try {
      await onSubmit(buildProductPayload(form));
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, control) => (
    <div>
      <label htmlFor={`pf-${name}`} className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      {control}
      {errors[name] && <p className="mt-1 text-xs text-app-error">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} aria-label="New product" className="max-w-xl space-y-4 rounded-2xl border border-app-border bg-white p-6 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-app-green">New Product</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {field(
          "name",
          "Name",
          <input id="pf-name" className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />,
        )}
        {field(
          "category",
          "Category",
          <select id="pf-category" className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>,
        )}
        {field(
          "price",
          "Price ($)",
          <input id="pf-price" inputMode="decimal" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} />,
        )}
        {field(
          "originalPrice",
          "Original price ($)",
          <input
            id="pf-originalPrice"
            inputMode="decimal"
            className={inputClass}
            value={form.originalPrice}
            onChange={(e) => set("originalPrice", e.target.value)}
          />,
        )}
        {field(
          "stock",
          "Stock",
          <input id="pf-stock" inputMode="numeric" className={inputClass} value={form.stock} onChange={(e) => set("stock", e.target.value)} />,
        )}
        {field(
          "unit",
          "Unit",
          <input id="pf-unit" className={inputClass} value={form.unit} onChange={(e) => set("unit", e.target.value)} />,
        )}
      </div>

      {field(
        "description",
        "Description",
        <textarea id="pf-description" rows={2} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />,
      )}

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        {/* ROOT CAUSE (isOrganic = "on"): a checkbox's e.target.value is its static value attribute.
            FIX: control it with `checked` and read e.target.checked. */}
        <input type="checkbox" checked={form.isOrganic} onChange={(e) => set("isOrganic", e.target.checked)} />
        Organic
      </label>

      {saveError && (
        <p role="alert" className="text-sm text-app-error">
          {saveError}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-app-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
};

export default ProductForm;
