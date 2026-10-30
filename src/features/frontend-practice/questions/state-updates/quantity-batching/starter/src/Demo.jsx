// src/Demo.jsx — read-only. Two pickers wired to the cart store through a slow fake API
// (1.2 s per call), so overlapping "Add to cart" clicks are easy to produce by hand.
import ProductQuantityPicker from "./components/ProductQuantityPicker";
import useCartStore from "./store/useCartStore";
import { products } from "./data/products";

const addToCartApi = async (product, quantity) => {
  console.log("POST /cart/items", product.name, quantity);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  useCartStore.getState().add_item(product, quantity);
};

export default function Demo() {
  const totalItems = useCartStore((state) => state.total_items);

  return (
    <div className="space-y-3">
      <p className="text-sm text-app-text-light">
        Items in cart: <b className="text-app-green">{totalItems}</b>
      </p>
      <div className="flex flex-wrap gap-4">
        <ProductQuantityPicker product={products[1]} onAdd={addToCartApi} />
        <ProductQuantityPicker product={products[0]} onAdd={addToCartApi} />
      </div>
    </div>
  );
}
