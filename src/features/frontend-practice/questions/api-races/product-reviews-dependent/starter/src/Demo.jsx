// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// Reviews for Organic Bananas (p1) are slow (1.2 s) and the reviews service always fails for
// Hass Avocados (p3), see src/api/reviewsApi.js. Requests are logged to the Console so you can
// see whether the product and reviews requests overlap.
import { useState } from "react";
import ProductDetails from "./components/ProductDetails";
import api from "./api/axios";
import reviewsApi from "./api/reviewsApi";

api.__configure({ latency: 200 });

const realGet = api.get;
api.get = (url, options) => {
  console.log("-> product request " + url);
  return realGet(url, options).then((r) => (console.log("<- product response " + url), r));
};
const realList = reviewsApi.list;
reviewsApi.list = (id) => {
  console.log("-> reviews request " + id);
  return realList(id).then(
    (r) => (console.log("<- reviews response " + id), r),
    (e) => (console.log("<- reviews FAILED " + id), Promise.reject(e)),
  );
};

const choices = [
  { id: "p1", label: "Organic Bananas" },
  { id: "p2", label: "Whole Milk" },
  { id: "p3", label: "Hass Avocados" },
];

export default function Demo() {
  const [productId, setProductId] = useState("p2");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.id}
            onClick={() => setProductId(c.id)}
            className={`rounded-full border px-3 py-1 text-sm ${
              productId === c.id ? "border-app-green bg-app-green text-white" : "border-app-border bg-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ProductDetails productId={productId} />
    </div>
  );
}
