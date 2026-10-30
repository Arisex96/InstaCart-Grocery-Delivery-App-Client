// src/components/CategoryChipBar.jsx — mobile replacement for the category sidebar on the Products page
// (see the category buttons in client/src/pages/Products.tsx).
//
// Props
//   categories  [{ slug, name }]            order matters
//   products    [{ _id, category, ... }]    category is a category slug
//   active      "all" | <slug>              the selected chip (default "all")
//   onChange    (slug | "all") => void
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders it
// for a few catalogues, and the Target UI output tab shows the finished bar.

const CategoryChipBar = ({ categories, products, active = "all", onChange }) => {
  // TODO: count products per category slug.
  // TODO: render "All (<total>)" followed by one chip per category, in order.
  // TODO: active chip -> aria-pressed + filled style; chips with 0 products -> disabled.
  // TODO: clicking a chip calls onChange(slug) ("all" for the All chip).
  void categories;
  void products;
  void active;
  void onChange;

  return (
    <div className="rounded-xl border border-dashed border-app-border p-3 text-sm text-app-text-light">
      Category chips go here.
    </div>
  );
};

export default CategoryChipBar;
