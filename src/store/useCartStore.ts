import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "../types";
import toast from "react-hot-toast";

// i m practising writing a store by myself

//define interface

//add 4 card items with some quantity

const dummy_cart_item: CartItem[] = [];

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: dummy_cart_item,
      total_price: dummy_cart_item.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
      total_items: dummy_cart_item.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
      isCartOpen: false,

      toggle_cart_view: () =>
        set((state) => {
          return {
            isCartOpen: !state.isCartOpen,
          };
        }),

      add_item: (product, quantity) =>
        set((state) => {
          const found = state.items.find(
            (it) => it.product._id === product._id,
          );

          const maxStock =
            product.stock !== undefined && product.stock !== null
              ? product.stock
              : Infinity;

          if (found) {
            const potentialQty = found.quantity + quantity;
            if (potentialQty > maxStock) {
              const allowedQty = maxStock - found.quantity;
              if (allowedQty <= 0) {
                toast.error(
                  `Cannot add more. Stock limit of ${maxStock} reached.`,
                );
                return state;
              }
              toast.error(
                `Only ${maxStock} items available. Added remaining ${allowedQty} to cart.`,
              );
              quantity = allowedQty;
            }

            const items = state.items.map((it) =>
              it.product._id === product._id
                ? { ...it, quantity: it.quantity + quantity }
                : it,
            );
            toast.success(`Added ${product.name} to cart.`);
            return {
              items,
              total_price: items.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0,
              ),
              total_items: items.reduce(
                (total, item) => total + item.quantity,
                0,
              ),
            };
          } else {
            if (quantity > maxStock) {
              toast.error(`Only ${maxStock} items available in stock.`);
              quantity = maxStock;
            }
            if (quantity <= 0) {
              return state;
            }
            const items = [...state.items, { product, quantity }];
            toast.success(`Added ${product.name} to cart.`);
            return {
              items,
              total_price: items.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0,
              ),
              total_items: items.reduce(
                (total, item) => total + item.quantity,
                0,
              ),
            };
          }
        }),

      remove_item: (product_id) =>
        set((state) => {
          const found = state.items.find((it) => it.product._id === product_id);

          if (!found) return state;

          const items = state.items.filter(
            (it) => it.product._id !== product_id,
          );
          toast.success(`Removed ${found.product.name} from cart.`);
          return {
            items,
            total_price: items.reduce(
              (total, item) => total + item.product.price * item.quantity,
              0,
            ),
            total_items: items.reduce(
              (total, item) => total + item.quantity,
              0,
            ),
          };
        }),

      update_quantity: (product_id, quantity) =>
        set((state) => {
          const found = state.items.find((it) => it.product._id === product_id);

          if (!found) return state;

          if (quantity <= 0) {
            const items = state.items.filter(
              (it) => it.product._id !== product_id,
            );
            toast.success(`Removed ${found.product.name} from cart.`);
            return {
              items,
              total_price: items.reduce(
                (total, item) => total + item.product.price * item.quantity,
                0,
              ),
              total_items: items.reduce(
                (total, item) => total + item.quantity,
                0,
              ),
            };
          }

          const maxStock =
            found.product.stock !== undefined && found.product.stock !== null
              ? found.product.stock
              : Infinity;
          if (quantity > maxStock) {
            toast.error(`Cannot exceed stock limit of ${maxStock} units.`);
            quantity = maxStock;
          }

          const items = state.items.map((it) =>
            it.product._id === product_id ? { ...it, quantity } : it,
          );
          return {
            items,
            total_price: items.reduce(
              (total, item) => total + item.product.price * item.quantity,
              0,
            ),
            total_items: items.reduce(
              (total, item) => total + item.quantity,
              0,
            ),
          };
        }),

      clear_cart: () =>
        set(() => ({
          items: [],
          total_price: 0,
          total_items: 0,
        })),
    }),
    {
      name: "cart-storage",
    },
  ),
);

export default useCartStore;
