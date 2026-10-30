// src/Demo.jsx — read-only. Two saved lists loaded from the "server cache".
// The data is deep-frozen (as in development) so any in-place mutation fails loudly in the Console.
import SavedLists from "./components/SavedLists";
import { products } from "./data/products";

const deepFreeze = (value) => {
  Object.values(value).forEach((v) => v && typeof v === "object" && deepFreeze(v));
  return Object.freeze(value);
};

const serverLists = deepFreeze([
  {
    id: "weekly",
    name: "Weekly shop",
    items: [
      { product: products[0], quantity: 1 },
      { product: products[1], quantity: 2 },
    ],
  },
  { id: "party", name: "Party", items: [{ product: products[1], quantity: 1 }, { product: products[8], quantity: 2 }] },
]);

export default function Demo() {
  return <SavedLists initialLists={serverLists} />;
}
