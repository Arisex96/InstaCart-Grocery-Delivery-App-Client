// src/components/SearchBar.jsx — the search box of the Navbar (modelled on client/src/components/Navbar.tsx).
//
//  * The box mirrors the ?search= URL parameter (so Back/Forward and shared links work).
//  * Typing writes the text to the URL after a pause (debounce).
//  * Enter searches immediately.
//
// Props: debounceMs — the pause before typing is written to the URL (500 in the real app).
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

const SearchBar = ({ debounceMs = 500 }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [searchText, setSearchText] = useState(urlSearch);
  const debouncedText = useDebounce(searchText, debounceMs);

  // FIX: the box -> URL effect must run because the TYPED text settled, never because the URL changed.
  // The latest URL values are kept in a ref, so the effect can read them without depending on them.
  const latest = useRef({ urlSearch, searchParams });
  useEffect(() => {
    latest.current = { urlSearch, searchParams };
  });

  // Builds ?search=… with URLSearchParams (encodes special characters, keeps other params).
  const goTo = (text) => {
    const params = new URLSearchParams(latest.current.searchParams);
    if (text) {
      params.set("search", text);
    } else {
      params.delete("search");
    }
    const query = params.toString();
    navigate(query ? `/products?${query}` : "/products");
  };

  // URL -> box (Back/Forward, links)
  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  // box -> URL (after the typing pause).
  // ROOT CAUSE: this effect also depended on `urlSearch`. On Back the URL changed while
  // `debouncedText` still held the newer search for one more debounce interval, so the effect saw
  // "debounced !== url" and navigated forward again — undoing Back and trapping the shopper.
  useEffect(() => {
    if (debouncedText !== latest.current.urlSearch) goTo(debouncedText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-2.5 size-4 text-app-text-light" />
      <input
        type="search"
        aria-label="Search products"
        placeholder="Search for groceries..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Second bug: `/products?search=${searchText}` did not encode "&" or "#".
            goTo(searchText.trim());
          }
        }}
        className="w-full rounded-full border border-app-border bg-app-cream py-2 pl-9 pr-4 text-sm focus:border-app-green"
      />
    </div>
  );
};

export default SearchBar;
