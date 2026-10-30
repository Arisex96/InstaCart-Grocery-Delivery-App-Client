// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The buttons call notify() from a component below the provider, like any screen would.
import { NotificationProvider, useNotifications } from "./components/NotificationProvider";

function Controls() {
  const { notify } = useNotifications();
  let counter = 0;

  const spam = () => {
    // Five calls in one click handler: only the newest three may stay visible.
    for (let i = 1; i <= 5; i++) notify({ type: "info", message: `Spam notification ${i}`, duration: 6000 });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-app-text-light">Fire notifications and watch the stack in the bottom-right corner.</p>
      <div className="flex flex-wrap gap-2">
        {[
          ["Success", () => notify({ type: "success", message: "Added Bananas to cart.", duration: 4000 })],
          ["Error", () => notify({ type: "error", message: "Only 3 items available in stock.", duration: 6000 })],
          ["Info", () => notify({ message: `Delivery slot saved (${++counter})` })],
          ["Spam 5", spam],
          ["Sticky", () => notify({ type: "info", message: "Sticky: dismiss me manually", duration: 0 })],
        ].map(([label, onClick]) => (
          <button
            key={label}
            onClick={onClick}
            className="rounded-full border border-app-border bg-white px-4 py-2 text-sm font-semibold text-app-green hover:bg-app-cream"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <NotificationProvider defaultDuration={4000} maxVisible={3}>
      <Controls />
    </NotificationProvider>
  );
}
