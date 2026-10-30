// src/Demo.jsx — read-only. The live preview renders this file's default export.
// It keeps the products in state (like the admin page does after a save), logs every callback to the
// Console tab and shows the last action, so you can see what your table reports to its parent.
import { useState } from "react";
import AdminProductsTable from "./components/AdminProductsTable";
import { products as base } from "./data/products";

const many = Array.from({ length: 30 }, (_, i) => ({
  ...base[i % base.length],
  _id: `m${i}`,
  name: `${base[i % base.length].name} #${i + 1}`,
}));

const DATASETS = { "12 products": base, "30 products": many, "No products": [] };

export default function Demo() {
  const [dataset, setDataset] = useState("12 products");
  const [products, setProducts] = useState(base);
  const [last, setLast] = useState("nothing yet");

  const choose = (name) => {
    setDataset(name);
    setProducts(DATASETS[name]);
    setLast("nothing yet");
  };

  const onStockChange = (id, stock) => {
    console.log("onStockChange", id, stock);
    setProducts((all) => all.map((p) => (p._id === id ? { ...p, stock } : p)));
    setLast(`stock of ${id} set to ${stock}`);
  };

  const onBulkUpdate = (ids) => {
    console.log("onBulkUpdate", ids);
    setProducts((all) => all.map((p) => (ids.includes(p._id) ? { ...p, stock: 0 } : p)));
    setLast(`marked ${ids.length} product(s) out of stock`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {Object.keys(DATASETS).map((name) => (
          <button
            key={name}
            onClick={() => choose(name)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              name === dataset ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {name}
          </button>
        ))}
        <span className="text-xs text-app-text-light">Last action: {last}</span>
      </div>
      <AdminProductsTable products={products} onStockChange={onStockChange} onBulkUpdate={onBulkUpdate} />
    </div>
  );
}
