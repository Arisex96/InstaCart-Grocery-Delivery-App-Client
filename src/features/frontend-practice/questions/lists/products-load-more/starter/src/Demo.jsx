// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The fake API normally has no pagination, so this file adds it: 700 ms latency, `page`/`limit`
// params and a `hasMore` flag, on top of the fixture catalogue (12 products).
import { useState } from "react";
import LoadMoreProducts from "./components/LoadMoreProducts";
import api from "./api/axios";
import { categories, serverProducts } from "./data/products";

api.get = async (url, { params }) => {
  console.log("GET " + url, JSON.stringify(params));
  await new Promise((resolve) => setTimeout(resolve, 700));
  const list = params.category && params.category !== "all" ? serverProducts.filter((p) => p.category === params.category) : serverProducts;
  const start = (params.page - 1) * params.limit;
  return { data: { products: list.slice(start, start + params.limit), hasMore: start + params.limit < list.length } };
};

export default function Demo() {
  const [category, setCategory] = useState("all");

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-app-border bg-white px-3 py-1.5"
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <LoadMoreProducts category={category} pageSize={4} />
    </div>
  );
}
