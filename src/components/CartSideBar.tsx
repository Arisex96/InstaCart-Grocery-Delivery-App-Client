import { useEffect } from "react";
import useCartStore from "../store/useCartStore";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import type { CartItem, CartState } from "../types";

const CartSideBar = () => {
  const {
    items,
    total_items,
    total_price,
    isCartOpen,

    toggle_cart_view,
    remove_item,
    update_quantity,
  } = useCartStore();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const deliveryFee = total_price > 50 || total_price === 0 ? 0 : 5;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex flex-row">
        <div className="flex-1" onClick={toggle_cart_view}></div>

        <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-md flex flex-col">
          {/** Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-250">
            {/** Cart Icon and Title */}
            <div className="flex flex-row gap-2 items-center">
              <ShoppingCart className="size-6" />
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <span className="text-xs text-gray-500 bg-yellow-200 px-2 rounded-full">
                {total_items} items
              </span>
            </div>

            <button
              onClick={toggle_cart_view}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/** Empty Cart */}
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="size-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-gray-500">Add items to your cart</p>
              </div>
            </div>
          ) : (
            <>
              {/** Cart Items (Flexible and Scrollable) */}
              <div className="flex-1 overflow-y-auto">
                {items.map((item) => (
                  <Item_card
                    key={item.product._id}
                    item={item}
                    update_quantity={update_quantity}
                    remove_item={remove_item}
                  />
                ))}
              </div>

              {/** Cart Summary */}
              <div className="border-t border-gray-250 py-2 px-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Subtotal</span>
                  <span className="text-gray-400 text-sm">${total_price}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Delivery</span>
                  <span className="text-gray-400 text-sm">
                    {deliveryFee === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      `$${deliveryFee}`
                    )}
                  </span>
                </div>
              </div>

              {/** Cart Checkout Summary */}
              <div className="p-4 border-t border-gray-250">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    ${total_price + deliveryFee}
                  </span>
                </div>
                <button className="w-full bg-app-orange text-white py-2 rounded-lg hover:bg-app-orange/90 transition-colors">
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface ItemCardProps {
  item: CartItem;
  update_quantity: CartState["update_quantity"];
  remove_item: CartState["remove_item"];
}

const Item_card = ({ item, update_quantity, remove_item }: ItemCardProps) => {
  {
    /** image,name ,unit, +,- update quantity, remove button */
  }

  const { product, quantity } = item;

  return (
    <div className="bg-app-cream m-2 p-2 flex flex-row items-center justify-between rounded-lg">
      <div className="flex flex-row gap-2">
        <div className="h-[70px] w-[70px] rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-gray-400">
            ${product.price} / {product.unit}
          </p>
          <p className="text-md text-black">${product.price * quantity}</p>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <button
          onClick={() => update_quantity(product._id, quantity - 1)}
          className="bg-gray-200 px-2 rounded-full"
        >
          -
        </button>
        <span className="text-sm">{quantity}</span>
        <button
          onClick={() => update_quantity(product._id, quantity + 1)}
          className="bg-gray-200 px-2 rounded-full"
        >
          +
        </button>
        <button
          onClick={() => remove_item(product._id)}
          className="bg-red-200 px-2 rounded-full"
        >
          <Trash2 className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default CartSideBar;

/***
 * 
 * interface CartState {
   items: CartItem[];
   total_items: number;
   total_price: number;
   isCartOpen : boolean;
   setCartOpen : (value:boolean)=>void;
   add_item: (product: Product, quantity: number) => void;
   remove_item: (product_id: string) => void;
   update_quantity: (product_id: string, quantity: number) => void;
 
   clear_cart: () => void;
 }
 * 
 */
