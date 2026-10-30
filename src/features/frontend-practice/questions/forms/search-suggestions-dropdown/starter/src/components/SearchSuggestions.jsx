// src/components/SearchSuggestions.jsx — navbar search with live suggestions
// (modelled on client/src/components/Navbar.tsx, which already debounces its input with useDebounce).
//
// Props
//   onSelect(product)   called when the shopper picks a suggestion
//   debounceMs          wait after the last keystroke before searching, default 250
//
// Data
//   const { data } = await api.get("/products", { params: { search } });   // data.products: [{ id, name, price, ... }]
//
// Build it from the UI requirements in the Problem tab (ARIA combobox pattern). The Demo
// (src/Demo.jsx) shows the picked product; the "Target UI" output tab shows the finished dropdown.
import { useState } from "react";
import { Search } from "lucide-react";
// import api from "../api/axios";
// import useDebounce from "../hooks/useDebounce";

const SearchSuggestions = ({ onSelect, debounceMs = 250 }) => {
  const [query, setQuery] = useState("");

  // TODO: debounce the query and fetch suggestions in an effect (ignore stale responses).
  // TODO: state for open / activeIndex / status ("idle" | "loading" | "success" | "error") / results.
  // TODO: keyboard handling: ArrowDown / ArrowUp (wrap), Enter (pick active), Escape (close).
  // TODO: combobox attributes: role, aria-expanded, aria-controls, aria-activedescendant.

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-2.5 size-4 text-app-text-light" />
      <input
        aria-label="Search products"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for groceries..."
        className="w-full rounded-full border border-app-border bg-app-cream py-2 pl-9 pr-4 text-sm"
      />
      {/* TODO: the suggestions listbox ({String(Boolean(onSelect))}, {debounceMs}ms) */}
    </div>
  );
};

export default SearchSuggestions;
