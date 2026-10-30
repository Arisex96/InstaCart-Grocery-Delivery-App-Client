// src/components/OrderSummary.jsx — the card shown beside the checkout form
// (see client/src/pages/Checkout.tsx for the real thing).
//
// Props
//   items   [{ product: { _id, name, price, ... }, quantity }]   (same shape as the cart store)

const DELIVERY_CENTS = 499;
const FREE_DELIVERY_FROM_CENTS = 5000;
const TAX_RATE = 0.18;

// APPROACH: do all money maths in integer cents so 1.2 × 3 is exactly 360, and only
// format to dollars at the very edge. Everything is derived from props during render.
const toCents = (dollars) => Math.round(dollars * 100);
const dollars = (cents) => "$" + (cents / 100).toFixed(2);

const Row = ({ label, value, strong, valueClass = "" }) => (
  <div className="flex items-center justify-between">
    <dt className={strong ? "text-base font-bold text-app-green" : "text-sm text-app-text-light"}>{label}</dt>
    <dd className={`${strong ? "text-xl font-bold text-app-green" : "text-sm font-semibold text-app-text"} ${valueClass}`}>
      {value}
    </dd>
  </div>
);

const OrderSummary = ({ items }) => {
  const lines = items.map(({ product, quantity }) => ({
    id: product._id,
    name: product.name,
    quantity,
    cents: toCents(product.price) * quantity,
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.cents, 0);
  const freeDelivery = subtotal >= FREE_DELIVERY_FROM_CENTS; // exactly $50.00 is free
  const delivery = freeDelivery ? 0 : DELIVERY_CENTS;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + delivery + tax;

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl text-app-green">Order summary</h2>

      {lines.length === 0 ? (
        <p className="mt-3 text-sm text-app-text-light">Your cart is empty</p>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-app-cream-dark">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="font-medium text-app-text">{line.name}</span>{" "}
                  <span className="text-app-text-light">× {line.quantity}</span>
                </span>
                <span className="font-semibold text-app-text">{dollars(line.cents)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-3 space-y-2 border-t border-app-border pt-3">
            <Row label="Subtotal" value={dollars(subtotal)} />
            <Row label="Delivery" value={freeDelivery ? "Free" : dollars(delivery)} valueClass={freeDelivery ? "text-app-success" : ""} />
            <Row label="Tax (18%)" value={dollars(tax)} />
            <Row label="Total" value={dollars(total)} strong />
          </dl>

          {!freeDelivery && (
            <p className="mt-3 rounded-lg bg-app-cream px-3 py-2 text-xs text-app-text-light">
              Add {dollars(FREE_DELIVERY_FROM_CENTS - subtotal)} more for free delivery
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default OrderSummary;
