// src/components/emptyStates.jsx — the three situations that use <EmptyState />.
import { InboxIcon, SearchIcon, ShoppingCartIcon } from "lucide-react";
import EmptyState from "./EmptyState";

// APPROACH: wrappers are tiny. They only carry the approved copy and wire callbacks into
// EmptyState, so there is no duplicated markup to drift apart.
export const EmptyCart = ({ onContinue }) => (
  <EmptyState
    icon={<ShoppingCartIcon className="size-12" />}
    title="Your cart is empty"
    description="Looks like you haven't added anything yet. Fresh groceries are a click away."
    actionLabel="Continue shopping"
    onAction={onContinue}
  />
);

export const NoResults = ({ query, onClear }) => {
  // A missing or whitespace-only query falls back to the generic title.
  const trimmed = query?.trim();
  return (
    <EmptyState
      icon={<SearchIcon className="size-12" />}
      title={trimmed ? `No results for "${trimmed}"` : "No products found"}
      description="Try a different spelling, or clear your filters to see everything."
      // The button only exists when it can do something.
      actionLabel={onClear ? "Clear filters" : undefined}
      onAction={onClear}
    />
  );
};

export const NoOrders = ({ onBrowse, onSupport }) => (
  <EmptyState
    icon={<InboxIcon className="size-12" />}
    title="No orders yet"
    description="When you place an order it will show up here so you can track it."
    actionLabel="Start shopping"
    onAction={onBrowse}
    secondaryLabel={onSupport ? "Need help?" : undefined}
    onSecondary={onSupport}
  />
);
