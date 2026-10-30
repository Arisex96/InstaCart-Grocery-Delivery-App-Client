// src/components/OrderSummary.jsx — the card shown beside the checkout form
// (see client/src/pages/Checkout.tsx for the real thing).
//
// Props
//   items   [{ product: { _id, name, price, ... }, quantity }]   (same shape as the cart store)
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders this
// component with a few sample carts, and the "Target UI" output tab shows the finished design.

const DELIVERY_FEE = 4.99;
const FREE_DELIVERY_FROM = 50;
const TAX_RATE = 0.18;

const OrderSummary = ({ items }) => {
  // TODO: derive the lines, subtotal, delivery, tax and total from `items`.
  // TODO: money must come out as "$12.34" with no floating point noise.
  // TODO: render the empty-cart state.

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl text-app-green">Order summary</h2>
      <p className="mt-3 text-sm text-app-text-light">Not built yet ({items.length} lines, {DELIVERY_FEE}, {FREE_DELIVERY_FROM}, {TAX_RATE}).</p>
    </section>
  );
};

export default OrderSummary;
