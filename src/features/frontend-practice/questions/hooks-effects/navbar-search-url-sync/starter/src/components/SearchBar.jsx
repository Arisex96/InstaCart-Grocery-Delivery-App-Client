// src/components/SearchBar.jsx — the search box of the Navbar (modelled on client/src/components/Navbar.tsx).
//
//  * The box mirrors the ?search= URL parameter (so Back/Forward and shared links work).
//  * Typing writes the text to the URL after a pause (debounce).
//  * Enter searches immediately.
//
// Props: debounceMs — the pause before typing is written to the URL (500 in the real app).
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

const SearchBar = ({ debounceMs = 500 }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [searchText, setSearchText] = useState(urlSearch);
  const debouncedText = useDebounce(searchText, debounceMs);

  // URL -> box (Back/Forward, links)
  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  // box -> URL (after the typing pause). `urlSearch` was added to satisfy the exhaustive-deps lint rule.
  useEffect(() => {
    if (debouncedText !== urlSearch) {
      const params = new URLSearchParams(searchParams);
      if (debouncedText) {
        params.set("search", debouncedText);
      } else {
        params.delete("search");
      }
      const query = params.toString();
      navigate(query ? `/products?${query}` : "/products");
    }
  }, [debouncedText, urlSearch]);

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
            navigate(`/products?search=${searchText}`);
          }
        }}
        className="w-full rounded-full border border-app-border bg-app-cream py-2 pl-9 pr-4 text-sm focus:border-app-green"
      />
    </div>
  );
};

export default SearchBar;
