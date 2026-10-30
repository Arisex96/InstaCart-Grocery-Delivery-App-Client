// src/Demo.jsx — read-only. The live preview renders this file's default export.
// onAdd takes about 600 ms and can be told to fail, so you can watch every state.
import { useRef, useState } from "react";
import AddToCartButton from "./components/AddToCartButton";
import { products } from "./data/products";

export default function Demo() {
  const [requests, setRequests] = useState(0);
  const [failNext, setFailNext] = useState(false);
  const failRef = useRef(false);
  failRef.current = failNext;

  const onAdd = async (product) => {
    setRequests((n) => n + 1);
    console.log("POST /cart/items", product.name);
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (failRef.current) throw new Error("Server said no");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-app-text-light">
        Requests sent: <b className="text-app-green">{requests}</b>
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} />
        Make the next request fail
      </label>
      <AddToCartButton product={products[0]} onAdd={onAdd} resetMs={1500} />
    </div>
  );
}
