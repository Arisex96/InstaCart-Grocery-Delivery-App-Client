// src/components/emptyStates.jsx — the three situations that use <EmptyState />.
// Copy comes from the UI requirements in the Problem tab (it has to match exactly).
import { InboxIcon, SearchIcon, ShoppingCartIcon } from "lucide-react";
import EmptyState from "./EmptyState";

// TODO: icon, title, description and primary action as specified.
export const EmptyCart = ({ onContinue }) => (
  <EmptyState icon={<ShoppingCartIcon className="size-12" />} title="TODO" description="TODO" onAction={onContinue} />
);

// TODO: the title depends on `query` (trimmed); the primary action only exists when onClear is given.
export const NoResults = ({ query, onClear }) => (
  <EmptyState icon={<SearchIcon className="size-12" />} title={`TODO ${query ?? ""}`} description="TODO" onAction={onClear} />
);

// TODO: secondary "Need help?" button only when onSupport is given.
export const NoOrders = ({ onBrowse, onSupport }) => (
  <EmptyState icon={<InboxIcon className="size-12" />} title="TODO" description="TODO" onAction={onBrowse} onSecondary={onSupport} />
);
