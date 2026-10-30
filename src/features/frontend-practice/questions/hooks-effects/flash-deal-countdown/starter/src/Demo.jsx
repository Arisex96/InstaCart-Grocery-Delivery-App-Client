// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// To make leaks visible, this demo counts the setInterval timers that are alive right
// now ("Active interval timers"). A correct hook leaves 0 behind when the timer is hidden.
import { useEffect, useState } from "react";
import DealTimer from "./components/DealTimer";
import ProductCard from "./components/ProductCard";
import { products } from "./data/products";

// Keep the original timer functions on window so re-running the preview does not stack wrappers.
const realSetInterval = (window.__realSetInterval ??= window.setInterval);
const realClearInterval = (window.__realClearInterval ??= window.clearInterval);
const active = (window.__activeIntervals = new Set());
window.setInterval = (...args) => {
  const id = realSetInterval.apply(window, args);
  active.add(id);
  return id;
};
window.clearInterval = (id) => {
  active.delete(id);
  return realClearInterval.call(window, id);
};

export default function Demo() {
  const [show, setShow] = useState(true);
  const [seconds, setSeconds] = useState(10);
  const [alive, setAlive] = useState(0);

  useEffect(() => {
    // This poll uses the real setInterval on purpose, so it is not counted.
    const poll = realSetInterval(() => setAlive(active.size), 200);
    return () => realClearInterval(poll);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {show ? <DealTimer seconds={seconds} /> : <span className="text-sm text-app-text-light">(timer hidden)</span>}
        <button
          onClick={() => setShow((v) => !v)}
          className="rounded-full border border-app-border bg-white px-3 py-2 text-sm hover:bg-app-cream"
        >
          {show ? "Hide timer" : "Show timer"}
        </button>
        <button
          onClick={() => setSeconds(20)}
          className="rounded-full border border-app-border bg-white px-3 py-2 text-sm hover:bg-app-cream"
        >
          Restart with 20 seconds
        </button>
      </div>
      <p className="text-sm text-app-text-light">
        Active interval timers: <b className="text-app-green">{alive}</b>
      </p>
      <div className="max-w-[200px]">
        <ProductCard product={products[1]} />
      </div>
    </div>
  );
}
