// src/components/ProductDetailPanel.jsx: the main section of the product page
// (client/src/pages/ProductPage.tsx is the real page).
//
// Props
//   product   { _id, name, price, originalPrice, discount, image, unit, stock, rating, reviewCount,
//               description (may be null), category (slug), isOrganic }
//   images    array of image URLs for the gallery (may be empty: fall back to [product.image])
//   reviews   [{ _id, name, rating, comment }]
//   onAdd     (product, quantity) => void
import { useId, useState } from "react";
import { MinusIcon, PlusIcon, ShoppingCart, StarIcon } from "lucide-react";
import { categories } from "../data/products";

const money = (n) => "$" + n.toFixed(2);
const TABS = ["description", "details", "reviews"];
const LOW_STOCK = 5;

// APPROACH: the real component holds only four pieces of local state (image index, quantity,
// tab, message). Everything else is derived from props while rendering.
function Panel({ product, images, reviews, onAdd }) {
  const uid = useId();
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("description");
  const [message, setMessage] = useState("");

  const { name, price, originalPrice, discount, rating, reviewCount, unit, stock, description, category, isOrganic } = product;
  const soldOut = stock <= 0;
  const lowStock = stock > 0 && stock <= LOW_STOCK;
  const gallery = images.length > 0 ? images : [product.image];
  const categoryName = categories.find((c) => c.slug === category)?.name ?? category;

  const add = () => {
    if (soldOut) return;
    onAdd?.(product, quantity);
    setMessage(`Added ${quantity} × ${name} to cart`);
    setQuantity(1);
  };

  const tabId = (t) => `${uid}-tab-${t}`;
  const panelId = (t) => `${uid}-panel-${t}`;
  const tabLabel = (t) => (t === "reviews" ? `Reviews (${reviews.length})` : t[0].toUpperCase() + t.slice(1));

  // Roving tabindex + arrow keys: the ARIA tabs pattern needs both, not just click handlers.
  const onTabKeyDown = (e) => {
    const i = TABS.indexOf(tab);
    const next =
      e.key === "ArrowRight" ? (i + 1) % TABS.length
      : e.key === "ArrowLeft" ? (i + TABS.length - 1) % TABS.length
      : e.key === "Home" ? 0
      : e.key === "End" ? TABS.length - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next]);
    document.getElementById(tabId(TABS[next]))?.focus();
  };

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-app-cream/50 p-4">
            <img src={gallery[imageIndex]} alt={name} className="max-h-full max-w-full object-contain" />
          </div>
          <div role="group" aria-label="Product images" className="mt-3 flex gap-2">
            {gallery.map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Show image ${i + 1} of ${gallery.length}`}
                aria-pressed={i === imageIndex}
                onClick={() => setImageIndex(i)}
                className={`size-16 overflow-hidden rounded-xl border-2 bg-white p-1 ${
                  i === imageIndex ? "border-app-green" : "border-app-border hover:border-app-green-lighter"
                }`}
              >
                <img src={src} alt="" className="size-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-3xl text-app-green">{name}</h1>
          <p className="flex items-center gap-1 text-sm text-app-text-light">
            <StarIcon className="size-4 fill-app-warning text-app-warning" aria-hidden="true" />
            <span>
              {rating} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </p>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-bold text-app-green">{money(price)}</span>
            {discount > 0 && (
              <>
                <s className="text-sm text-zinc-400">{money(originalPrice)}</s>
                <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold leading-none text-white">
                  {discount}% OFF
                </span>
              </>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{unit}</span>
          </div>

          {lowStock && <p className="text-sm font-semibold text-app-warning">Only {stock} left</p>}

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Quantity selector" className="flex items-center gap-2 rounded-full border border-app-border p-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={soldOut || quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
                className="rounded-full bg-app-cream p-2 disabled:opacity-40"
              >
                <MinusIcon className="size-4" />
              </button>
              <span role="status" aria-label="Quantity" className="w-8 text-center font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={soldOut || quantity >= stock}
                onClick={() => setQuantity((q) => q + 1)}
                className="rounded-full bg-app-cream p-2 disabled:opacity-40"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={add}
              disabled={soldOut}
              className="inline-flex items-center gap-2 rounded-full bg-app-green px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-app-green-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              {soldOut ? "Out of stock" : "Add to cart"}
            </button>
          </div>
          {message && (
            <p role="status" aria-label="Cart message" className="text-sm font-medium text-app-success">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div role="tablist" aria-label="Product information" onKeyDown={onTabKeyDown} className="flex gap-1 border-b border-app-border">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={tabId(t)}
              aria-selected={tab === t}
              aria-controls={panelId(t)}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium ${
                tab === t ? "border-b-2 border-app-orange text-app-green" : "text-app-text-light hover:text-app-green"
              }`}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>

        {/* Only the selected panel is rendered, so there is exactly one tabpanel. */}
        <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)} className="py-4 text-sm text-app-text">
          {tab === "description" && <p>{description ?? "No description available."}</p>}
          {tab === "details" && (
            <dl className="grid max-w-sm grid-cols-2 gap-y-2">
              <dt className="text-app-text-light">Unit</dt>
              <dd className="font-medium">{unit}</dd>
              <dt className="text-app-text-light">Category</dt>
              <dd className="font-medium">{categoryName}</dd>
              <dt className="text-app-text-light">Organic</dt>
              <dd className="font-medium">{isOrganic ? "Yes" : "No"}</dd>
              <dt className="text-app-text-light">Availability</dt>
              <dd className="font-medium">{soldOut ? "Out of stock" : `${stock} in stock`}</dd>
            </dl>
          )}
          {tab === "reviews" &&
            (reviews.length === 0 ? (
              <p className="text-app-text-light">No reviews yet</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r, i) => (
                  <li key={r._id ?? i} className="rounded-xl bg-app-cream p-3">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-app-text-light">Rated {r.rating} out of 5</p>
                    <p className="mt-1">{r.comment}</p>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </div>
    </section>
  );
}

// FIX for "state must reset when the product changes": key the stateful panel by product id.
// React then throws the old instance away, so no effect has to mirror props into state.
const ProductDetailPanel = ({ product, images = [], reviews = [], onAdd }) => (
  <Panel key={product._id} product={product} images={images} reviews={reviews} onAdd={onAdd} />
);

export default ProductDetailPanel;
