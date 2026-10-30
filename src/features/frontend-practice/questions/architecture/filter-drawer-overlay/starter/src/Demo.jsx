// src/Demo.jsx — read-only. The live preview renders this file's default export.
// "onClose calls" counts every time the drawer asks to be closed, so you can see stray calls.
import { useState } from "react";
import FilterDrawer from "./components/FilterDrawer";
import { categories } from "./data/products";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [closeCalls, setCloseCalls] = useState(0);

  // Not memoised on purpose: callers usually pass an inline function.
  const handleClose = () => {
    setCloseCalls((n) => n + 1);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm font-semibold shadow-sm"
        >
          Filters
        </button>
        <p className="text-sm text-app-text-light">
          Category: <b className="text-app-green">{category}</b> · onClose calls:{" "}
          <b data-testid="close-calls" className="text-app-green">{closeCalls}</b>
        </p>
      </div>
      <p className="text-xs text-app-text-light">Press Escape with the drawer closed, then open it and click a category.</p>

      <FilterDrawer open={open} onClose={handleClose} title="Filter Options">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Categories</h4>
        <div className="flex flex-col gap-1">
          {["all", ...categories.map((c) => c.slug)].map((slug) => (
            <button
              key={slug}
              onClick={() => setCategory(slug)}
              className={
                "w-full rounded-xl px-3 py-2 text-left text-sm " +
                (category === slug ? "bg-app-green font-semibold text-white" : "text-zinc-600 hover:bg-app-cream")
              }
            >
              {slug}
            </button>
          ))}
        </div>
      </FilterDrawer>
    </div>
  );
}
