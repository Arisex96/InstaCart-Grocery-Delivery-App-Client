import { create } from "zustand";
import type { CartItem, CartState } from "../types";
import { dummyProducts } from "../assets/assets";

// i m practising writing a store by myself

//define interface

//add 4 card items with some quantity

const dummy_cart_item: CartItem[] = [
  {
    product: dummyProducts[0],
    quantity: 1,
  },
  {
    product: dummyProducts[1],
    quantity: 2,
  },
  {
    product: dummyProducts[2],
    quantity: 3,
  },
  {
    product: dummyProducts[3],
    quantity: 4,
  },
];


const useCartStore = create<CartState>((set) => ({
  

  
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
      //check if the item already exists
      const found = state.items.find((it) => it.product._id === product._id);

      if (found) {
        const items = state.items.map((it) =>
          it.product._id === product._id
            ? { ...it, quantity: it.quantity + quantity }
            : it,
        );
        return {
          items,
          total_price: items.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
          ),
          total_items: items.reduce((total, item) => total + item.quantity, 0),
        };
      } else {
        const items = [...state.items, { product, quantity }];
        return {
          items,
          total_price: items.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
          ),
          total_items: items.reduce((total, item) => total + item.quantity, 0),
        };
      }
    }),

  remove_item: (product_id) =>
    set((state) => {
      const found = state.items.find((it) => it.product._id === product_id);

      if (!found) return state;

      const items = state.items.filter((it) => it.product._id !== product_id);
      return {
        items,
        total_price: items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        ),
        total_items: items.reduce((total, item) => total + item.quantity, 0),
      };
    }),

  update_quantity: (product_id, quantity) =>
    set((state) => {
      const found = state.items.find((it) => it.product._id === product_id);

      if (!found) return state;

      if (quantity <= 0) {
        const items = state.items.filter((it) => it.product._id !== product_id);
        return {
          items,
          total_price: items.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
          ),
          total_items: items.reduce((total, item) => total + item.quantity, 0),
        };
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
        total_items: items.reduce((total, item) => total + item.quantity, 0),
      };
    }),

  clear_cart: () =>
    set(() => ({
      items: [],
      total_price: 0,
      total_items: 0,
    })),
}));

export default useCartStore;
