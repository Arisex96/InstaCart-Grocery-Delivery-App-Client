// src/components/AdminProductsTable.jsx — the product table of the admin dashboard
// (client/src/pages/admin/AdminProducts.tsx is the real page).
//
// Props
//   products        [{ _id, name, category, price, stock }]
//   onStockChange   (id, newStock) => void        an inline stock edit was saved
//   onBulkUpdate    (ids) => void                  "Mark out of stock" for the selected products
//   pageSize        rows per page (default 5)
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) keeps the products
// in state and renders this component; the "Target UI" tab shows the finished table.
import { useState } from "react";
import StockCell from "./StockCell";
import { categories } from "../data/products";
import { PAGE_SIZE, filterProducts, nextSort, paginate, sortProducts } from "../lib/tableUtils";

const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name ?? slug;

const AdminProductsTable = ({ products, onStockChange, onBulkUpdate, pageSize = PAGE_SIZE }) => {
  // TODO: search text, sort, current page and the set of selected product ids (selection must
  // survive paging, sorting and searching).
  const [query] = useState("");
  const rows = paginate(sortProducts(filterProducts(products, query), null), 1, pageSize);

  void nextSort;
  void onBulkUpdate;

  return (
    <section className="rounded-2xl border border-app-border bg-white p-4">
      <h2 className="font-serif text-2xl text-app-green">Products</h2>
      {/* TODO: search box, sortable headers (aria-sort), selection column + bulk action bar, pagination */}
      <table aria-label="Products" className="mt-3 w-full text-left text-sm">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col">Price</th>
            <th scope="col">Stock</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{categoryName(p.category)}</td>
              <td>{p.price}</td>
              <td>
                <StockCell product={p} onSave={onStockChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default AdminProductsTable;
