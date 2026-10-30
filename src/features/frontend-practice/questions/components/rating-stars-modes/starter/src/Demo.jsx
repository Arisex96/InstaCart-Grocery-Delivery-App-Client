// src/Demo.jsx — read-only. The live preview renders this file's default export.
import { useState } from "react";
import RatingStars from "./components/RatingStars";
import { products } from "./data/products";

const shown = [products[0], products[1], products[7], products[8]]; // 4.7, 4.5, 4.1, 4.8

export default function Demo() {
  const [chosen, setChosen] = useState(0);
  const [lastClick, setLastClick] = useState("none yet");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-app-border bg-white p-4">
        <h3 className="mb-2 font-serif text-lg text-app-green">Product cards (read-only)</h3>
        <ul className="space-y-1.5 text-sm">
          {shown.map((p) => (
            <li key={p._id} className="flex items-center gap-2">
              <RatingStars rating={p.rating} readOnly onChange={(n) => setLastClick(`${p.name} → ${n}`)} />
              <span className="text-app-text-light">
                {p.rating} · {p.name}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <RatingStars rating={7} readOnly />
            <span className="text-app-text-light">Bad data (rating 7)</span>
          </li>
        </ul>
        <p className="mt-2 text-xs text-app-text-light">
          Last reported click on a read-only card: <b>{lastClick}</b>
        </p>
      </section>

      <section className="rounded-2xl border border-app-border bg-white p-4">
        <h3 className="mb-2 font-serif text-lg text-app-green">Write a review</h3>
        <RatingStars rating={chosen} onChange={setChosen} size={22} />
        <p className="mt-2 text-sm text-app-text-light">
          Your rating: <b>{chosen || "—"}</b> (try Tab and Enter)
        </p>
      </section>
    </div>
  );
}
