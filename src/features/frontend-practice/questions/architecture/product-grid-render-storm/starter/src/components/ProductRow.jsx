// src/components/ProductRow.jsx — one line of the product list (name, price, add button).
// `onRender(id)` is called while rendering so render counts can be observed (preview + tests).
import { PlusIcon } from "lucide-react";

const ProductRow = ({ product, onAdd, onRender }) => {
  onRender?.(product._id);

  return (
    <li className="flex items-center justify-between rounded-2xl border border-app-border bg-white px-4 py-3">
      <div>
        <p className="font-bold text-app-text">{product.name}</p>
        <p className="text-xs text-app-text-light">
          ${product.price.toFixed(2)} / {product.unit}
        </p>
      </div>
      <button
        onClick={() => onAdd(product)}
        aria-label={"Add " + product.name + " to cart"}
        className="rounded-full bg-app-green p-2 text-white shadow-md hover:bg-app-green-light active:scale-95"
      >
        <PlusIcon className="size-5" />
      </button>
    </li>
  );
};

export default ProductRow;
