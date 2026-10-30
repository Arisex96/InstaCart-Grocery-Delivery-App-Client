// src/components/ui/Button.jsx — shared button meant to replace the copy-pasted markup in
// ProductGrid ("Clear All Filters"), Products ("Filters") and the cart (remove).
// The class strings below are the ones those components use today.
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-app-green hover:bg-app-green-light text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95",
  secondary:
    "border border-app-border bg-white text-zinc-700 font-semibold px-4 py-2 rounded-xl hover:bg-app-cream/35 shadow-sm",
  danger: "bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full active:scale-95",
};

// Used like: <Button variant="secondary" onClick={openFilters} aria-label="Open filters">Filters</Button>
const Button = ({ variant = "primary", loading = false, children, className }) => {
  return (
    <button className={VARIANTS[variant]}>
      {loading && <Loader2 className="mr-2 inline size-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
