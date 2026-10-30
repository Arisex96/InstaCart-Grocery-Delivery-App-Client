// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// To make the race easy to reproduce, this demo slows the fake server down:
// short queries (fewer than 5 characters) take 900 ms, longer ones only 100 ms.
// So typing "ba" and then finishing "banana" makes the older request finish last.
import ProductSearch from "./components/ProductSearch";
import api from "./api/axios";

api.__configure({ latencyFor: (url, params) => ((params.search ?? "").length < 5 ? 900 : 100) });

export default function Demo() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-app-text-light">
        Type <b>ba</b>, then quickly finish <b>banana</b>. Watch the Console tab for failed requests.
      </p>
      <ProductSearch debounceMs={250} />
    </div>
  );
}
