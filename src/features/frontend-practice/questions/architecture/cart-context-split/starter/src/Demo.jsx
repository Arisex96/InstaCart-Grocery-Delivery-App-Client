// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Render counters (right) are read from a plain object, so the panel itself never causes renders
// of the shop. Type in the search box and add products, and watch which counters climb.
import { useEffect, useState } from "react";
import Shop from "./components/Shop";
import { products } from "./data/products";

const rows = products.slice(0, 4);
const counts = {};
const onRender = (key) => {
  counts[key] = (counts[key] || 0) + 1;
};

function Counters() {
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 300);
    return () => clearInterval(timer);
  }, []);
  return (
    <aside className="rounded-xl bg-app-cream-dark p-3 text-xs">
      <p className="mb-1 font-bold uppercase tracking-wider text-zinc-500">Renders so far</p>
      <p>badge: {counts.badge || 0}</p>
      {rows.map((p) => (
        <p key={p._id}>
          {p.name}: {counts[p._id] || 0}
        </p>
      ))}
    </aside>
  );
}

export default function Demo() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_200px]">
      <Shop products={rows} onRender={onRender} />
      <Counters />
    </div>
  );
}
