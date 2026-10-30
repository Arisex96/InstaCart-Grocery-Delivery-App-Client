// src/Demo.jsx — read-only. The live preview renders this file's default export.
// "Saving" waits 600 ms and shows the payload that would be POSTed to /products.
import { useState } from "react";
import ProductForm from "./components/ProductForm";

export default function Demo() {
  const [saved, setSaved] = useState(null);

  const save = async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log("payload", payload);
    setSaved(payload);
  };

  return (
    <div className="space-y-4">
      <ProductForm onSubmit={save} />
      <pre className="max-w-xl overflow-auto rounded-2xl bg-app-green p-4 text-xs text-white">
        {saved ? JSON.stringify(saved, null, 2) : "Payload will appear here after saving"}
      </pre>
    </div>
  );
}
