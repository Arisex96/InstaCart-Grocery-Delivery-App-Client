// src/Demo.jsx — read-only. The live preview renders this file's default export.
// 12 sample products, 4 per page to start. Try: 5 per page + Next until the end; go to the last
// page and then search; go to page 2 and change "per page".
import PaginatedProducts from "./components/PaginatedProducts";
import { products } from "./data/products";

export default function Demo() {
  return <PaginatedProducts products={products} initialPageSize={4} />;
}
