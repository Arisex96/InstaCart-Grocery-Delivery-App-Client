// src/store/cartReducer.js — a useReducer port of client/src/store/useCartStore.ts.
// Item shape: { product, quantity }   Product: { _id, name, price, stock, ... }
// State shape: { items, total_items, total_price }
//
// Actions
//   { type: "add", product, quantity }
//   { type: "remove", productId }
//   { type: "update", productId, quantity }
//   { type: "clear" }
//
// QA found: repeat "Add" clicks do nothing visible, the item count is off after removing, stock is
// not enforced and "update" crashes for products that are not in the cart.

export const initialCartState = { items: [], total_items: 0, total_price: 0 };

export function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const found = state.items.find((it) => it.product._id === action.product._id);
      if (found) {
        found.quantity += action.quantity;
        return state;
      }
      state.items.push({ product: action.product, quantity: action.quantity });
      state.total_items += action.quantity;
      state.total_price += action.product.price * action.quantity;
      return { ...state };
    }

    case "remove": {
      const items = state.items.filter((it) => it.product._id !== action.productId);
      return { ...state, items };
    }

    case "update": {
      const item = state.items.find((it) => it.product._id === action.productId);
      item.quantity = action.quantity;
      return { ...state };
    }

    case "clear":
      return initialCartState;

    default:
      return state;
  }
}
