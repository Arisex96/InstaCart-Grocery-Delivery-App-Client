// src/components/StockCell.jsx — the stock number of one table row, editable in place.
//
// Props
//   product  { _id, name, stock }
//   onSave   (id, newStock) => void     called only with a valid whole number >= 0
//
// APPROACH: the cell is controlled by its parent (it always displays product.stock) and only owns
// the draft text while editing. Validation happens on save, through the pure parseStock helper.
import { useState } from "react";
import { parseStock } from "../lib/tableUtils";

const StockCell = ({ product, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const start = () => {
    setDraft(String(product.stock));
    setError("");
    setEditing(true);
  };

  const commit = () => {
    const result = parseStock(draft);
    if (!result.ok) {
      setError("Enter a whole number, 0 or more"); // stay in edit mode so the user can fix it
      return;
    }
    setEditing(false);
    onSave(product._id, result.value);
  };

  if (!editing) {
    return (
      <button
        onClick={start}
        aria-label={`Edit stock for ${product.name}`}
        className="rounded-md px-2 py-0.5 font-semibold text-app-text hover:bg-app-cream"
      >
        {product.stock}
      </button>
    );
  }

  return (
    <div>
      <input
        type="number"
        autoFocus
        aria-label={`Stock for ${product.name}`}
        aria-invalid={error ? "true" : undefined}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          else if (e.key === "Escape") setEditing(false);
        }}
        className="w-20 rounded-lg border border-app-border px-2 py-1 text-sm focus:border-app-green"
      />
      {error && (
        <p role="alert" className="mt-1 text-xs text-app-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default StockCell;
