// src/Demo.jsx — read-only. The live preview renders this file's default export inside an
// in-memory router (so the real browser URL is never touched).
//
// Use the links to jump to URL-driven states, the speed buttons to see loading and error states,
// and watch the URL read-out while you use your page.
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import api from "./api/axios";

const LINKS = [
  ["All", "/"],
  ["Bakery", "/?category=bakery"],
  ["Cheapest first", "/?sort=price-low"],
  ["Page 2", "/?page=2"],
  ["Page 99 (too far)", "/?page=99"],
  ["Page abc (invalid)", "/?page=abc"],
  ["Search: milk", "/?search=milk"],
  ["Nothing found", "/?search=zzzz"],
];

const chip = "rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold text-app-text hover:bg-app-cream";

export default function Demo() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-app-green px-3 py-2 font-mono text-xs text-white">
        URL: {location.pathname}
        {location.search || ""}
      </div>

      <div className="flex flex-wrap gap-2">
        {LINKS.map(([label, to]) => (
          <Link key={to} to={to} className={chip}>
            {label}
          </Link>
        ))}
        <button className={chip} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className={chip} onClick={() => navigate(1)}>
          Forward →
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-light">
        Server:
        <button className={chip} onClick={() => api.__configure({ latency: 60, failNext: 0 })}>
          Fast
        </button>
        <button className={chip} onClick={() => api.__configure({ latency: 1500 })}>
          Slow (1.5 s)
        </button>
        <button className={chip} onClick={() => api.__configure({ failNext: 1 })}>
          Fail next request
        </button>
      </div>

      <ProductsPage debounceMs={300} />
    </div>
  );
}
