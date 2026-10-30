// src/components/PriceTag.jsx — the price block used by ProductCard and the product page
// (see client/src/components/ProductCard.tsx and client/src/pages/ProductPage.tsx).
//
// Props
//   product   { price, originalPrice, discount, unit }

// APPROACH: tiny formatting helpers (cents-based so 1.2 never prints noise), then derive every
// state once from the product and reuse it for the visuals AND the screen reader sentence.
const money = (n) => "$" + (Math.round(n * 100) / 100).toFixed(2);

// "12 pk" -> "$0.42 / pk"; "each" -> "$2.00 / each"; empty unit -> no line.
const perUnitText = (price, unit) => {
  const text = (unit || "").trim();
  if (!text) return null;
  const match = /^(\d+(?:\.\d+)?)\s+(.+)$/.exec(text);
  const count = match ? Number(match[1]) : 1;
  const label = match ? match[2] : text;
  if (!count) return null;
  return `${money(price / count)} / ${label}`;
};

const PriceTag = ({ product }) => {
  const { price, originalPrice, discount, unit } = product;

  const free = price === 0;
  // A "discount" only counts when the old price really is higher (guards bad data).
  const onSale = discount > 0 && originalPrice > price;
  const current = free ? "Free" : money(price);
  const unitText = free ? null : perUnitText(price, unit);

  // One sentence for assistive tech, built from the same values as the visuals.
  const spoken = onSale
    ? `Now ${current}, was ${money(originalPrice)}, ${Math.round(discount)}% off`
    : free
      ? "Free"
      : `Price ${current}`;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="sr-only">{spoken}</span>
      <div aria-hidden="true" className="flex flex-wrap items-baseline gap-2">
        <span className={`text-lg font-bold ${onSale ? "text-red-600" : "text-app-green"}`}>{current}</span>
        {onSale && <del className="text-xs text-zinc-400">{money(originalPrice)}</del>}
        {onSale && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold leading-none text-white">
            {Math.round(discount)}% OFF
          </span>
        )}
      </div>
      {unitText && <span className="text-xs text-app-text-light">{unitText}</span>}
    </div>
  );
};

export default PriceTag;
