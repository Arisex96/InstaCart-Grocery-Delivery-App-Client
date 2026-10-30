// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The fake "server" takes 700 ms and rejects any address whose label is "fail".
import { useState } from "react";
import AddressForm from "./components/AddressForm";

const saveAddress = (address) =>
  new Promise((resolve, reject) => {
    console.log("POST /addresses", address);
    setTimeout(() => {
      if (address.label.toLowerCase() === "fail") reject(new Error("Server rejected the address"));
      else resolve(address);
    }, 700);
  });

export default function Demo() {
  const [saved, setSaved] = useState([]);
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-4">
      {open ? (
        <AddressForm
          onSave={async (address) => {
            await saveAddress(address);
            setSaved((list) => [...list, address]);
          }}
          onClose={() => setOpen(false)}
        />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-app-green px-4 py-2 text-sm font-semibold text-white hover:bg-app-green-light"
        >
          Add another address
        </button>
      )}
      <div>
        <h3 className="font-serif text-lg font-bold text-app-green">Saved ({saved.length})</h3>
        <ul className="mt-1 space-y-1 text-sm">
          {saved.map((a, i) => (
            <li key={i} className="rounded-lg bg-white p-2">
              {a.label}: {a.address}, {a.city}, {a.state} {a.zip} · default: {String(a.isDefault)} · lat/lng:{" "}
              {JSON.stringify([a.lat, a.lng])}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
