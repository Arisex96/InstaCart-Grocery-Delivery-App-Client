// src/components/FilterDrawer.jsx — the slide-in panel extracted from the mobile filters in
// client/src/pages/Products.tsx (same structure: dark backdrop + white side panel).
// Controlled component: the parent owns `open` and decides what onClose does.
//
//   <FilterDrawer open={open} onClose={() => setOpen(false)} title="Filter Options">...</FilterDrawer>
import { useEffect, useId } from "react";
import { X } from "lucide-react";

const FilterDrawer = ({ open, onClose, title, children }) => {
  const titleId = useId();

  // ROOT CAUSE (leak): this effect had no dependency array and no cleanup, so every render added
  // another window listener, none was ever removed, and they were active even while closed.
  // FIX: only listen while open, depend on [open, onClose], and remove the listener in the cleanup.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // FIX: render nothing when closed (it used to stay mounted and merely get a "hidden" class).
  if (!open) return null;

  return (
    // role/aria-*: tell assistive technology that a modal dialog appeared and what it is called.
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {/* ROOT CAUSE (closes on any click): onClick was on this wrapper, an ancestor of the panel, so
          clicks inside the panel bubbled up to it. FIX: the handler lives on the backdrop sibling. */}
      <div className="absolute inset-0 bg-black/40" data-testid="drawer-backdrop" onClick={onClose} />

      {/* Content side drawer */}
      <div className="relative flex h-full w-80 flex-col overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-app-border pb-4">
          <h3 id={titleId} className="font-serif text-xl font-bold text-app-green">
            {title}
          </h3>
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
