// src/components/GroupedProducts.jsx — "Shop by aisle": products grouped under their category.
//
// Props
//   products     [{ _id, name, price, category (slug), ... }]  the same array the Products page renders
//   categories   [{ slug, name }]  ordered like categoriesData in client/src/assets/assets.ts
//
// QA findings: headers show slugs, sections are in a random-looking order, "apple" comes after
// "Banana", and the Products page above this component changes order once it mounts.
const GroupedProducts = ({ products, categories }) => {
  const sorted = products.sort((a, b) => (a.name < b.name ? -1 : 1));

  const groups = {};
  sorted.forEach((product) => {
    if (!groups[product.category]) groups[product.category] = [];
    groups[product.category].push(product);
  });

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groups).map(([slug, items], index) => (
        <section key={index} aria-label={slug}>
          <h3 className="mb-2 border-b border-app-border pb-1 font-serif text-xl text-app-green">
            {slug} ({items.length})
          </h3>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((product, i) => (
              <li key={i} className="rounded-xl border border-app-border bg-white p-3">
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
