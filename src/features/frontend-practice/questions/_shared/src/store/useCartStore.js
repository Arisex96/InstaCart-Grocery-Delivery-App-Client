// Simplified copy of client/src/store/useCartStore.ts (same action names and
// stock rules). The real one also persists to localStorage; the sandbox has no
// storage, so this version keeps the cart in memory only.
import { create } from "zustand";
import toast from "react-hot-toast";

const totals = (items) => ({
  items,
  total_price: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  total_items: items.reduce((sum, item) => sum + item.quantity, 0),
});

const useCartStore = create((set) => ({
  items: [],
  total_price: 0,
  total_items: 0,
  isCartOpen: false,

  toggle_cart_view: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  add_item: (product, quantity) =>
    set((state) => {
      const found = state.items.find((it) => it.product._id === product._id);
      const maxStock = product.stock ?? Infinity;

      if (found) {
        const allowed = Math.min(quantity, maxStock - found.quantity);
        if (allowed <= 0) {
          toast.error("Cannot add more. Stock limit of " + maxStock + " reached.");
          return state;
        }
        toast.success("Added " + product.name + " to cart.");
        return totals(
          state.items.map((it) => (it.product._id === product._id ? { ...it, quantity: it.quantity + allowed } : it)),
        );
      }
      const qty = Math.min(quantity, maxStock);
      if (qty <= 0) return state;
      toast.success("Added " + product.name + " to cart.");
      return totals([...state.items, { product, quantity: qty }]);
    }),

  remove_item: (productId) =>
    set((state) => {
      const found = state.items.find((it) => it.product._id === productId);
      if (!found) return state;
      toast.success("Removed " + found.product.name + " from cart.");
      return totals(state.items.filter((it) => it.product._id !== productId));
    }),

  update_quantity: (productId, quantity) =>
    set((state) => {
      const found = state.items.find((it) => it.product._id === productId);
      if (!found) return state;
      if (quantity <= 0) return totals(state.items.filter((it) => it.product._id !== productId));
      const qty = Math.min(quantity, found.product.stock ?? Infinity);
      return totals(state.items.map((it) => (it.product._id === productId ? { ...it, quantity: qty } : it)));
    }),

  clear_cart: () => set(() => totals([])),
}));

export default useCartStore;
