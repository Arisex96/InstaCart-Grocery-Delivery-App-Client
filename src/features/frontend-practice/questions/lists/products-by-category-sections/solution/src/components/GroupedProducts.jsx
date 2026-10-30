// src/components/GroupedProducts.jsx — "Shop by aisle": products grouped under their category.
//
// Props
//   products     [{ _id, name, price, category (slug), ... }]  the same array the Products page renders
//   categories   [{ slug, name }]  ordered like categoriesData in client/src/assets/assets.ts
//
// QA findings: headers show slugs, sections are in a random-looking order, "apple" comes after
// "Banana", and the Products page above this component changes order once it mounts.
const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

const GroupedProducts = ({ products, categories }) => {
  // ROOT CAUSE (mutation): `products.sort(...)` sorts the PROP array in place, reordering the
  // list other components render. FIX: sort a copy.
  // ROOT CAUSE (order of "apple"/"Banana"): `<` compares UTF-16 codes, so uppercase sorts first.
  // FIX: localeCompare (case-insensitive); Array#sort is stable, so equal names keep their order.
  const sorted = [...products].sort(byName);

  // Group first...
  const bySlug = new Map();
  for (const product of sorted) {
    if (!bySlug.has(product.category)) bySlug.set(product.category, []);
    bySlug.get(product.category).push(product);
  }

  // ROOT CAUSE (order + slugs): the old code grouped by first appearance and never looked at
  // `categories`. FIX: the ordered category list drives the output and supplies the display name.
  const sections = categories
    .filter((category) => bySlug.has(category.slug))
    .map((category) => ({ slug: category.slug, name: category.name, items: bySlug.get(category.slug) }));

  // Products whose category is not in the list are not lost: they go to a final "Other" section.
  const known = new Set(categories.map((c) => c.slug));
  const other = sorted.filter((product) => !known.has(product.category));
  if (other.length > 0) sections.push({ slug: "__other", name: "Other", items: other });

  return (
    <div className="flex flex-col gap-6">
      {sections.map(({ slug, name, items }) => (
        // FIX (keys): slug and _id are stable identities; indexes are not.
        <section key={slug} aria-label={name}>
          <h3 className="mb-2 border-b border-app-border pb-1 font-serif text-xl text-app-green">
            {name} ({items.length})
          </h3>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((product) => (
              <li key={product._id} className="rounded-xl border border-app-border bg-white p-3">
                <p className="text-sm font-bold text-app-text">{product.name}</p>
                <p className="text-sm text-app-green">${product.price.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default GroupedProducts;
