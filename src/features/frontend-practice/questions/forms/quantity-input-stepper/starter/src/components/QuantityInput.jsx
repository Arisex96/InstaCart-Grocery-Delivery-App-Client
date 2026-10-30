// src/components/QuantityInput.jsx — quantity control for the cart (see client/src/components/CartSideBar.tsx,
// which today only has + / - buttons).
//
// Props
//   value      current quantity (controlled by the parent)
//   onChange   (n) => void   called with the new quantity
//   min        default 1
//   max        default Infinity (the product's stock)
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders it for products
// with different stock levels and the "Target UI" output tab shows the finished control.
import { MinusIcon, PlusIcon } from "lucide-react";

const QuantityInput = ({ value, onChange, min = 1, max = Infinity }) => {
  // TODO: keep a draft string for the text box so the shopper can type freely.
  // TODO: only call onChange with whole numbers inside [min, max]; clamp or revert on blur.
  // TODO: disable the buttons at the bounds; show "Only N in stock" at a finite max.
  void onChange;
  void min;
  void max;

  return (
    <div>
      <button type="button">
        <MinusIcon className="size-4" />
      </button>
      <input value={value} readOnly aria-label="Quantity" className="w-12 text-center" />
      <button type="button">
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
};

export default QuantityInput;
