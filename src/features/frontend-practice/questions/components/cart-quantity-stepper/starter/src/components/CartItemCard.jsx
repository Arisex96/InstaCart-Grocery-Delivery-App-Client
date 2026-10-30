// src/components/CartItemCard.jsx — read-only. The real consumer of QuantityStepper,
// modelled on Item_card in client/src/components/CartSideBar.tsx.
import { Trash2 } from "lucide-react";
import useCartStore from "../store/useCartStore";
import QuantityStepper from "./QuantityStepper";

const CartItemCard = ({ item }) => {
  const update_quantity = useCartStore((state) => state.update_quantity);
  const remove_item = useCartStore((state) => state.remove_item);
  const { product, quantity } = item;

  return (
    <div className="bg-app-cream m-2 p-2 flex flex-row items-center justify-between rounded-lg">
      <div className="flex flex-row gap-2">
        <div className="h-[70px] w-[70px] rounded-lg overflow-hidden">
          <img src={product.image} alt={product.name} className="size-full object-cover" />
        </div>
        <div>
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-gray-400">
            ${product.price} / {product.unit}
          </p>
          <p className="text-md text-black">${(product.price * quantity).toFixed(2)}</p>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <QuantityStepper
          value={quantity}
          max={product.stock}
          onChange={(next) => update_quantity(product._id, next)}
          data-testid={"stepper-" + product._id}
        />
        <button
          onClick={() => remove_item(product._id)}
          aria-label={"Remove " + product.name}
          className="bg-red-200 p-1.5 rounded-full"
        >
          <Trash2 className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
