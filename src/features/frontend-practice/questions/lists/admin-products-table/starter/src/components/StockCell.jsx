// src/components/StockCell.jsx — the stock number of one table row, editable in place.
//
// Props
//   product  { _id, name, stock }
//   onSave   (id, newStock) => void     called only with a valid whole number >= 0
//
// TODO: show the number as a button (aria-label "Edit stock for <name>"). Clicking it switches to a
// number input (aria-label "Stock for <name>") prefilled with the current stock and focused.
// Enter saves, Escape cancels. Invalid input keeps the input open and shows an inline error
// (role="alert"). See the UI requirements for the exact texts.
import { parseStock } from "../lib/tableUtils";

const StockCell = ({ product, onSave }) => {
  void onSave;
  void parseStock;
  return <span>{product.stock}</span>;
};

export default StockCell;
