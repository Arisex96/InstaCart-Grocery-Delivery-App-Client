// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The fake server takes 600 ms and rejects instructions whose notes contain "fail".
// The payload it receives is printed below the form.
import { useState } from "react";
import DeliveryInstructionsForm from "./components/DeliveryInstructionsForm";

export default function Demo() {
  const [received, setReceived] = useState([]);

  const save = (payload) =>
    new Promise((resolve, reject) => {
      console.log("PUT /orders/draft/instructions", payload);
      setTimeout(() => {
        if ((payload.notes ?? "").includes("fail")) return reject(new Error("Server error"));
        setReceived((list) => [...list, payload]);
        resolve();
      }, 600);
    });

  return (
    <div className="space-y-4">
      <DeliveryInstructionsForm onSubmit={save} />
      <div>
        <h3 className="font-serif text-lg font-bold text-app-green">Payloads received by the server</h3>
        {received.length === 0 && <p className="text-sm text-app-text-light">Nothing yet.</p>}
        <ul className="mt-1 space-y-1 font-mono text-xs">
          {received.map((payload, i) => (
            <li key={i} className="rounded-lg bg-white p-2">
              {JSON.stringify(payload)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
