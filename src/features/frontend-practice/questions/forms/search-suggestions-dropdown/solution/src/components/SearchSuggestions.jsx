// src/components/SearchSuggestions.jsx — navbar search with live suggestions
// (modelled on client/src/components/Navbar.tsx, which already debounces its input with useDebounce).
//
// Props
//   onSelect(product)   called when the shopper picks a suggestion
//   debounceMs          wait after the last keystroke before searching, default 250
import { useEffect, useId, useState } from "react";
import { Search } from "lucide-react";
import api from "../api/axios";
import useDebounce from "../hooks/useDebounce";

const MAX_SUGGESTIONS = 5;

// APPROACH (highlight): never build a RegExp from user text ("c++" would throw). Find the first
// case-insensitive match by index and slice the ORIGINAL string, which keeps its capitalisation.
function Highlighted({ text, query }) {
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-bold text-app-green">{text.slice(at, at + query.length)}</strong>
      {text.slice(at + query.length)}
    </>
  );
}

const SearchSuggestions = ({ onSelect, debounceMs = 250 }) => {
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // -1 = nothing active
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [results, setResults] = useState([]);
  const search = useDebounce(query.trim(), debounceMs);

  useEffect(() => {
    if (!search) {
      setStatus("idle");
      setResults([]);
      return;
    }
    // APPROACH (stale responses): each run owns an `ignore` flag flipped by the cleanup.
    let ignore = false;
    setStatus("loading");
    api
      .get("/products", { params: { search } })
      .then(({ data }) => {
        if (ignore) return;
        setResults(data.products.slice(0, MAX_SUGGESTIONS));
        setActiveIndex(-1); // a new list invalidates the old highlight
        setStatus("success");
      })
      .catch(() => {
        if (ignore) return;
        setResults([]);
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [search]);

  const optionId = (index) => `${listboxId}-option-${index}`;
  const showList = open && query.trim() !== "";

  const choose = (product) => {
    onSelect?.(product);
    setQuery(product.name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (results.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const last = results.length - 1;
      setActiveIndex((i) => (e.key === "ArrowDown" ? (i >= last ? 0 : i + 1) : i <= 0 ? last : i - 1));
    } else if (e.key === "Enter" && showList && activeIndex >= 0) {
      e.preventDefault();
      choose(results[activeIndex]);
    }
  };

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-2.5 size-4 text-app-text-light" />
      <input
        role="combobox"
        aria-label="Search products"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? listboxId : undefined}
        aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search for groceries..."
        className="w-full rounded-full border border-app-border bg-app-cream py-2 pl-9 pr-4 text-sm focus:border-app-green"
      />

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute z-10 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-app-border bg-white py-1 shadow-lg"
        >
          {status === "loading" && (
            <li role="presentation" className="px-4 py-2 text-sm text-app-text-light">
              Searching…
            </li>
          )}
          {status === "error" && (
            <li role="presentation" className="px-4 py-2 text-sm text-app-error">
              Could not load suggestions
            </li>
          )}
          {status === "success" && results.length === 0 && (
            <li role="presentation" className="px-4 py-2 text-sm text-app-text-light">
              No matches
            </li>
          )}
          {status === "success" &&
            results.map((product, index) => (
              <li
                key={product.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                onClick={() => choose(product)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm ${
                  index === activeIndex ? "bg-app-cream" : ""
                }`}
              >
                <span className="text-app-text">
                  <Highlighted text={product.name} query={search} />
                </span>
                <span className="text-app-text-light">${product.price.toFixed(2)}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default SearchSuggestions;
