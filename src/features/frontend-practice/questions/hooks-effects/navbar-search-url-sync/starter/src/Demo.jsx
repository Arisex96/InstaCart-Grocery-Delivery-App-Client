// src/Demo.jsx — read-only. The live preview renders this file's default export inside an
// in-memory router (so the real page URL is never touched). The URL line below is that router's
// location; Back/Forward use its history.
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./components/SearchBar";

function UrlBar() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="space-y-2">
      <p className="rounded-xl bg-white px-3 py-2 font-mono text-xs text-app-green">
        URL: {location.pathname}
        {location.search}
      </p>
      <div className="flex gap-2">
        <button onClick={() => navigate(-1)} className="rounded-full border border-app-border bg-white px-4 py-1.5 text-sm">
          ← Back
        </button>
        <button onClick={() => navigate(1)} className="rounded-full border border-app-border bg-white px-4 py-1.5 text-sm">
          Forward →
        </button>
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <div className="max-w-md space-y-3">
      <p className="text-sm text-app-text-light">
        Search for <b>milk</b>, pause, then search for <b>eggs</b> and pause. Click Back.
      </p>
      <SearchBar debounceMs={400} />
      <UrlBar />
    </div>
  );
}
