// src/Demo.jsx — read-only. The live preview renders this file's default export.
// (The preview already provides an in-memory router, so clicks change the "URL" shown below.)
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "./components/Breadcrumbs";

export default function Demo() {
  const [showRetired, setShowRetired] = useState(false);
  const location = useLocation();

  return (
    <div className="space-y-4">
      <Breadcrumbs activeCategory="bakery" activeProductName="Butter Croissant 100g" />
      <Breadcrumbs activeCategory="all" />
      {showRetired && <Breadcrumbs activeCategory="seasonal-specials" activeProductName="Pumpkin Spice Latte" />}

      <button
        onClick={() => setShowRetired(true)}
        className="rounded-full bg-app-green px-4 py-2 text-sm font-semibold text-white hover:bg-app-green-light"
      >
        Open a product from a retired category
      </button>

      <p className="text-sm text-app-text-light">
        Current URL:{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-app-green">{location.pathname + location.search}</code>
      </p>
    </div>
  );
}
