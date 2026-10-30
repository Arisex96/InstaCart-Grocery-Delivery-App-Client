// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The fake server answers in ~150 ms. The counter below reads api.calls, the list of every
// request the fake api has received, so you can see how often ProductListing really fetches.
import { useEffect, useState } from "react";
import ProductListing from "./components/ProductListing";
import api from "./api/axios";
import { categories } from "./data/products";

api.__configure({ latency: 150 });

export default function Demo() {
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setRequests(api.calls.length), 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md space-y-3">
      <div className="flex gap-2">
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          aria-label="Max price"
          type="text"
          inputMode="decimal"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-24 rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <p className="text-sm">
        API requests so far: <span className="font-bold text-app-orange">{requests}</span>
      </p>
      <ProductListing category={category} maxPrice={maxPrice} />
    </div>
  );
}
