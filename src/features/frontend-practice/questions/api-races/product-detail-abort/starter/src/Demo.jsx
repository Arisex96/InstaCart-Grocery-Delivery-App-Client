// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The fake server is slow for Organic Bananas (p1: 1.2 s) and fast for everything else, so clicking
// Bananas and then Milk makes the older request finish last. Every request is logged to the Console,
// including whether its AbortSignal was passed and whether it was aborted.
import { useState } from "react";
import ProductDetail from "./components/ProductDetail";
import api from "./api/axios";

api.__configure({ latencyFor: (url) => (url.endsWith("/p1") ? 1200 : 150) });

const realGet = api.get;
api.get = (url, options) => {
  const signal = options && options.signal;
  console.log("GET " + url + (signal ? " (abortable)" : " (no AbortSignal passed)"));
  if (signal) signal.addEventListener("abort", () => console.log("aborted " + url));
  return realGet(url, options);
};

const choices = [
  { id: "p1", label: "Organic Bananas" },
  { id: "p2", label: "Whole Milk" },
  { id: "p3", label: "Hass Avocados" },
];

export default function Demo() {
  const [productId, setProductId] = useState("p3");
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
      <ProductDetail productId={productId} />
    </div>
  );
}
