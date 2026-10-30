// src/components/ProductRow.jsx — read-only. Only needs the cart ACTIONS; memoised on its props.
import { memo } from "react";
import { PlusIcon } from "lucide-react";
import { useCartActions } from "../context/CartContext";

const ProductRow = ({ product, onRender }) => {
  const { add } = useCartActions();
  onRender?.(product._id);

  return (
    <li className="flex items-center justify-between rounded-xl border border-app-border bg-white px-4 py-2">
      <span className="text-sm font-medium text-app-text">{product.name}</span>
      <span className="flex items-center gap-3">
        <span className="text-sm text-app-green">${product.price.toFixed(2)}</span>
        <button
          onClick={() => add(product)}
          aria-label={`Add ${product.name}`}
          className="rounded-full bg-app-green p-1.5 text-white hover:bg-app-green-light"
        >
          <PlusIcon className="size-4" />
        </button>
      </span>
    </li>
  );
};

export default memo(ProductRow);
