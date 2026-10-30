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
// ROOT CAUSE: only four props were destructured, so everything else (onClick, aria-label, disabled,
// type…) was dropped, and className was never used.
// FIX: collect the rest and forward it to the native <button>.
const Button = ({ variant = "primary", loading = false, disabled = false, className, children, ...rest }) => {
  // FIX: a loading button must not be clickable either.
  const isDisabled = disabled || loading;
  // FIX: merge the caller's classes instead of replacing the variant ones.
  const classes = [VARIANTS[variant], "disabled:opacity-60 disabled:cursor-not-allowed", className].filter(Boolean).join(" ");

  return (
    <button
      // FIX: a native button in a form defaults to submit; reusable buttons default to "button"
      // (rest comes after, so type="submit" still works when asked for).
      type="button"
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes}
    >
      {loading && <Loader2 className="mr-2 inline size-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
