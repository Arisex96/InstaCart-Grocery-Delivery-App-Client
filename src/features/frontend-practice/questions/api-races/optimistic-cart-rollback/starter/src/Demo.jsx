// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The fake server answers the request for quantity 1 slowly (1.2 s) and everything else quickly,
// so two quick clicks make the responses arrive out of order. Whole Milk has only 3 units:
// the 4th unit is rejected with 409 "Only 3 in stock".
import AddToCartControl from "./components/AddToCartControl";
import api from "./api/axios";
import { products } from "./data/products";

api.__configure({ latencyFor: (url, params, body) => (body && body.quantity === 1 ? 1200 : 200) });

export default function Demo() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-app-text-light">
        Click <b>+</b> twice quickly, then keep clicking until the stock runs out. Watch the number and the busy state.
      </p>
      <AddToCartControl product={products[1]} />
    </div>
  );
}
