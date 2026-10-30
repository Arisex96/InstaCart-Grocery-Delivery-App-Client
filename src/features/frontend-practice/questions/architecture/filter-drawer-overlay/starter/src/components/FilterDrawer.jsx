// src/components/FilterDrawer.jsx — the slide-in panel extracted from the mobile filters in
// client/src/pages/Products.tsx (same structure: dark backdrop + white side panel).
// Controlled component: the parent owns `open` and decides what onClose does.
//
//   <FilterDrawer open={open} onClose={() => setOpen(false)} title="Filter Options">...</FilterDrawer>
import { useEffect } from "react";
import { X } from "lucide-react";

const FilterDrawer = ({ open, onClose, title, children }) => {
  // Close on Escape.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
  });

  return (
    <div className={open ? "fixed inset-0 z-50 flex" : "hidden"} onClick={onClose}>
      {/* Overlay backdrop */}
      <div className="absolute inset-0 bg-black/40" data-testid="drawer-backdrop" />

      {/* Content side drawer */}
      <div className="relative flex h-full w-80 flex-col overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-app-border pb-4">
          <h3 className="font-serif text-xl font-bold text-app-green">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default FilterDrawer;
