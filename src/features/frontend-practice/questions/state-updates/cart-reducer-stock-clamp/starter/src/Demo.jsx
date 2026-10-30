// src/Demo.jsx — read-only. The live preview renders this file's default export.
import { useReducer } from "react";
import { Trash2 } from "lucide-react";
import { cartReducer, initialCartState } from "./store/cartReducer";
import { products } from "./data/products";

const shop = [products[0], products[1], products[3]]; // bananas (40), milk (3 in stock), croissant (12)

export default function Demo() {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-app-border bg-white p-4">
        <h3 className="mb-3 font-serif text-lg text-app-green">Shop</h3>
        <div className="flex flex-col gap-2">
          {shop.map((product) => (
            <button
              key={product._id}
              onClick={() => dispatch({ type: "add", product, quantity: 1 })}
              className="flex items-center justify-between rounded-xl border border-app-border bg-app-cream px-3 py-2 text-left text-sm hover:border-app-green"
            >
              <span>Add {product.name}</span>
              <span className="text-xs text-app-text-light">stock {product.stock}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-app-border bg-white p-4">
        <h3 className="mb-3 font-serif text-lg text-app-green">Cart</h3>
        {cart.items.length === 0 && <p className="text-sm text-app-text-light">Your cart is empty.</p>}
        <ul className="flex flex-col gap-2">
          {cart.items.map(({ product, quantity }) => (
            <li key={product._id} className="flex items-center justify-between rounded-xl bg-app-cream px-3 py-2 text-sm">
              <span>{product.name}</span>
              <span className="flex items-center gap-2">
                <button
                  aria-label={`Decrease ${product.name}`}
                  onClick={() => dispatch({ type: "update", productId: product._id, quantity: quantity - 1 })}
                  className="rounded-full bg-white px-2"
                >
                  −
                </button>
                <b>{quantity}</b>
                <button
                  aria-label={`Remove ${product.name}`}
                  onClick={() => dispatch({ type: "remove", productId: product._id })}
                  className="rounded-full bg-red-100 p-1 text-red-700"
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-app-border pt-2 text-sm">
          Items: <b>{cart.total_items}</b> · Total: <b>${cart.total_price.toFixed(2)}</b>
        </p>
        <button onClick={() => dispatch({ type: "clear" })} className="mt-2 text-xs text-app-text-light underline">
          Clear cart
        </button>
      </section>
    </div>
  );
}
