// src/Demo.jsx — read-only. The live preview renders this file's default export:
// a cart with three lines, like the cart sidebar would show.
import CartItemCard from "./components/CartItemCard";
import useCartStore from "./store/useCartStore";
import { products } from "./data/products";

// Seed the in-memory cart: bananas x1 (stock 40), milk x2 (stock 3), sourdough x8 (stock 8).
const seed = [
  { product: products[0], quantity: 1 },
  { product: products[1], quantity: 2 },
  { product: products[4], quantity: 8 },
];
useCartStore.setState({
  items: seed,
  total_items: seed.reduce((t, i) => t + i.quantity, 0),
  total_price: seed.reduce((t, i) => t + i.product.price * i.quantity, 0),
});

export default function Demo() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.total_price);

  return (
    <div className="max-w-md rounded-2xl border border-app-border bg-white p-3">
      <h2 className="px-2 font-serif text-xl font-bold text-app-green">Your cart</h2>
      {items.map((item) => (
        <CartItemCard key={item.product._id} item={item} />
      ))}
      {items.length === 0 && <p className="p-4 text-sm text-app-text-light">Cart is empty</p>}
      <p className="px-2 pt-2 text-right text-sm font-semibold">Total: ${totalPrice.toFixed(2)}</p>
    </div>
  );
}
