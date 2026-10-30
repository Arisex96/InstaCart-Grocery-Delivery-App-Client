import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminProductsTable from "./src/components/AdminProductsTable";
import { filterProducts, nextSort, pageCount, paginate, parseStock, sortProducts, stockStatus } from "./src/lib/tableUtils";
import { products } from "./src/data/products";

// Contract tests: roles, labels, text and behaviour from the UI requirements, never class names.
// Default order: Organic Bananas, Whole Milk, Hass Avocados, Butter Croissant 100g, Sourdough Loaf | Sparkling Water,
// Orange Juice, Sea Salt Chips, Dark Chocolate Bar, Free Range Eggs | Basmati Rice, Extra Virgin Olive Oil (12 total)
const show = (props = {}) => {
  const onStockChange = fn();
  const onBulkUpdate = fn();
  const utils = render(<AdminProductsTable products={products} onStockChange={onStockChange} onBulkUpdate={onBulkUpdate} {...props} />);
  return { onStockChange, onBulkUpdate, ...utils };
};
const table = () => screen.getByRole("table", { name: "Products" });
const bodyRows = () => within(table()).getAllByRole("row").slice(1);
const names = () => bodyRows().map((row) => within(row).getAllByRole("cell")[1].textContent);
const header = (name) => screen.getByRole("columnheader", { name });
const sortBy = (user, label) => user.click(within(header(label)).getByRole("button", { name: label }));
const rowOf = (name) => screen.getByText(name).closest("tr");
const checkbox = (name) => screen.getByRole("checkbox", { name });
const next = (user) => user.click(screen.getByRole("button", { name: "Next" }));

describe("table helpers", () => {
  it("cycles sort state: none -> asc -> desc -> none, restarting at asc for a new column", () => {
    expect(nextSort(null, "price")).toEqual({ key: "price", dir: "asc" });
    expect(nextSort({ key: "price", dir: "asc" }, "price")).toEqual({ key: "price", dir: "desc" });
    expect(nextSort({ key: "price", dir: "desc" }, "price")).toBe(null);
    expect(nextSort({ key: "price", dir: "desc" }, "stock")).toEqual({ key: "stock", dir: "asc" });
  });

  it("sorts a copy by name, price and stock and keeps the original order for null", () => {
    const original = products.map((p) => p._id);
    const byPrice = sortProducts(products, { key: "price", dir: "asc" });
    expect(byPrice.slice(0, 3).map((p) => p.name)).toEqual(["Organic Bananas", "Hass Avocados", "Butter Croissant 100g"]);
    expect(sortProducts(products, { key: "stock", dir: "desc" })[0].name).toBe("Sea Salt Chips");
    expect(sortProducts(products, { key: "name", dir: "asc" }).slice(0, 2).map((p) => p.name)).toEqual(["Basmati Rice", "Butter Croissant 100g"]);
    expect(sortProducts(products, null).map((p) => p._id)).toEqual(original);
    expect(products.map((p) => p._id)).toEqual(original); // input untouched
  });

  it("filters by name (case-insensitive, trimmed), paginates, and classifies stock", () => {
    expect(filterProducts(products, "  MILK ").map((p) => p.name)).toEqual(["Whole Milk"]);
    expect(filterProducts(products, "")).toHaveLength(12);
    expect(pageCount(12, 5)).toBe(3);
    expect(pageCount(0, 5)).toBe(1);
    expect(paginate(products, 3, 5).map((p) => p.name)).toEqual(["Basmati Rice", "Extra Virgin Olive Oil"]);
    expect([0, 1, 5, 6].map(stockStatus)).toEqual(["out", "low", "low", "ok"]);
  });

  it("parses stock input as a whole number >= 0", () => {
    expect(parseStock("12")).toEqual({ ok: true, value: 12 });
    expect(parseStock(" 7 ")).toEqual({ ok: true, value: 7 });
    expect(parseStock("0")).toEqual({ ok: true, value: 0 });
    for (const bad of ["", "  ", "-1", "2.5", "abc", "1e3"]) expect(parseStock(bad).ok).toBe(false);
  });
});

describe("table layout", () => {
  it("renders a real table with ordered column headers and the first 5 rows", () => {
    show();
    expect(within(table()).getAllByRole("columnheader").map((h) => h.textContent.replace(/[▲▼↕]/g, "").trim())).toEqual([
      "",
      "Name",
      "Category",
      "Price",
      "Stock",
    ]);
    expect(bodyRows()).toHaveLength(5);
    expect(names()).toEqual(["Organic Bananas", "Whole Milk", "Hass Avocados", "Butter Croissant 100g", "Sourdough Loaf"]);
  });

  it("formats price and category and flags Low and Out of stock rows", () => {
    show();
    expect(rowOf("Whole Milk")).toHaveTextContent("$3.50");
    expect(rowOf("Whole Milk")).toHaveTextContent("Dairy & Eggs");
    expect(rowOf("Whole Milk")).toHaveTextContent("Low"); // stock 3
    expect(rowOf("Hass Avocados")).toHaveTextContent("Out of stock"); // stock 0
    expect(rowOf("Organic Bananas")).not.toHaveTextContent("Low");
    expect(rowOf("Organic Bananas")).not.toHaveTextContent("Out of stock");
  });
});

describe("sorting", () => {
  it("cycles aria-sort none -> ascending -> descending -> none on the clicked column only", async () => {
    const user = userEvent.setup();
    show();
    expect(header("Price")).toHaveAttribute("aria-sort", "none");
    expect(header("Category")).not.toHaveAttribute("aria-sort");
    await sortBy(user, "Price");
    expect(header("Price")).toHaveAttribute("aria-sort", "ascending");
    expect(header("Name")).toHaveAttribute("aria-sort", "none");
    await sortBy(user, "Price");
    expect(header("Price")).toHaveAttribute("aria-sort", "descending");
    await sortBy(user, "Price");
    expect(header("Price")).toHaveAttribute("aria-sort", "none");
    expect(names()[0]).toBe("Organic Bananas"); // original order again
  });

  it("sorts all products, not just the visible page", async () => {
    const user = userEvent.setup();
    show();
    await sortBy(user, "Price");
    expect(names()).toEqual(["Organic Bananas", "Hass Avocados", "Butter Croissant 100g", "Dark Chocolate Bar", "Sea Salt Chips"]);
    await sortBy(user, "Price"); // descending
    expect(names()).toEqual(["Extra Virgin Olive Oil", "Basmati Rice", "Sourdough Loaf", "Sparkling Water", "Free Range Eggs"]);
  });

  it("sorts names alphabetically and stock numerically, and a new column starts ascending", async () => {
    const user = userEvent.setup();
    show();
    await sortBy(user, "Name");
    expect(names()).toEqual(["Basmati Rice", "Butter Croissant 100g", "Dark Chocolate Bar", "Extra Virgin Olive Oil", "Free Range Eggs"]);
    await sortBy(user, "Stock");
    expect(header("Name")).toHaveAttribute("aria-sort", "none");
    expect(header("Stock")).toHaveAttribute("aria-sort", "ascending");
    expect(names().slice(0, 3)).toEqual(["Hass Avocados", "Whole Milk", "Dark Chocolate Bar"]); // 0, 3, 5
  });

  it("goes back to page 1 when the sort changes and never mutates the products prop", async () => {
    const user = userEvent.setup();
    const input = products.map((p) => p._id);
    show();
    await next(user);
    await sortBy(user, "Name");
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(products.map((p) => p._id)).toEqual(input);
  });
});

describe("search", () => {
  it("filters by name case-insensitively, resets to page 1 and updates the counts", async () => {
    const user = userEvent.setup();
    show();
    await next(user);
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "MILK");
    expect(names()).toEqual(["Whole Milk"]);
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–1 of 1")).toBeInTheDocument();
  });

  it("shows empty messages for no match and for no products", async () => {
    const user = userEvent.setup();
    const { unmount } = show();
    await user.type(screen.getByRole("searchbox", { name: "Search products" }), "zzz");
    expect(screen.getByText("No products match “zzz”")).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(0);
    unmount();
    show({ products: [] });
    expect(screen.getByText("No products yet")).toBeInTheDocument();
  });
});

describe("pagination", () => {
  it("shows the page text and range and moves between pages", async () => {
    const user = userEvent.setup();
    show();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–5 of 12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await next(user);
    expect(names()).toEqual(["Sparkling Water", "Orange Juice", "Sea Salt Chips", "Dark Chocolate Bar", "Free Range Eggs"]);
    expect(screen.getByText("Showing 6–10 of 12")).toBeInTheDocument();

    await next(user);
    expect(names()).toEqual(["Basmati Rice", "Extra Virgin Olive Oil"]);
    expect(screen.getByText("Showing 11–12 of 12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
  });

  it("honours the pageSize prop and clamps the page when the list shrinks", () => {
    const { rerender, onStockChange, onBulkUpdate } = show({ pageSize: 4 });
    expect(bodyRows()).toHaveLength(4);
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    rerender(<AdminProductsTable products={products.slice(0, 5)} pageSize={4} onStockChange={onStockChange} onBulkUpdate={onBulkUpdate} />);
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(1);
  });
});

describe("selection and bulk action", () => {
  it("selects rows, shows 'N selected' and calls onBulkUpdate with ids in prop order, then clears", async () => {
    const user = userEvent.setup();
    const { onBulkUpdate } = show();
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    await user.click(checkbox("Select Hass Avocados"));
    await user.click(checkbox("Select Organic Bananas"));
    expect(screen.getByRole("status")).toHaveTextContent("2 selected");

    await user.click(screen.getByRole("button", { name: "Mark out of stock" }));
    expect(onBulkUpdate).toHaveBeenCalledTimes(1);
    expect(onBulkUpdate).toHaveBeenCalledWith(["p1", "p3"]);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(checkbox("Select Organic Bananas")).not.toBeChecked();
  });

  it("keeps the selection across pages and sorting (selected by id, not by row)", async () => {
    const user = userEvent.setup();
    const { onBulkUpdate } = show();
    await user.click(checkbox("Select Organic Bananas"));
    await next(user);
    await user.click(checkbox("Select Free Range Eggs"));
    expect(screen.getByRole("status")).toHaveTextContent("2 selected");

    await sortBy(user, "Name"); // different rows on page 1 now
    expect(checkbox("Select Free Range Eggs")).toBeChecked(); // Eggs is on page 1 when sorted by name
    expect(screen.queryByRole("checkbox", { name: "Select Organic Bananas" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mark out of stock" }));
    expect(onBulkUpdate).toHaveBeenCalledWith(["p1", "p10"]);
  });

  it("drives the header checkbox: unchecked, indeterminate, checked, and selects only the current page", async () => {
    const user = userEvent.setup();
    show();
    const all = () => screen.getByRole("checkbox", { name: "Select all on this page" });
    expect(all()).not.toBeChecked();
    expect(all().indeterminate).toBe(false);

    await user.click(checkbox("Select Whole Milk"));
    expect(all()).not.toBeChecked();
    expect(all().indeterminate).toBe(true);

    await user.click(all());
    expect(all()).toBeChecked();
    expect(all().indeterminate).toBe(false);
    expect(screen.getByRole("status")).toHaveTextContent("5 selected"); // page 1 only

    await user.click(all()); // toggles the whole page off
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("clears the selection with the Clear selection button", async () => {
    const user = userEvent.setup();
    show();
    await user.click(checkbox("Select Whole Milk"));
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("inline stock editing", () => {
  it("opens a prefilled number input and saves with Enter", async () => {
    const user = userEvent.setup();
    const { onStockChange } = show();
    await user.click(screen.getByRole("button", { name: "Edit stock for Organic Bananas" }));
    const input = screen.getByRole("spinbutton", { name: "Stock for Organic Bananas" });
    expect(input).toHaveValue(40);
    await user.clear(input);
    await user.type(input, "55{Enter}");
    expect(onStockChange).toHaveBeenCalledTimes(1);
    expect(onStockChange).toHaveBeenCalledWith("p1", 55);
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument(); // back to display mode
  });

  it("accepts 0 and cancels with Escape without calling anything", async () => {
    const user = userEvent.setup();
    const { onStockChange } = show();
    await user.click(screen.getByRole("button", { name: "Edit stock for Whole Milk" }));
    await user.clear(screen.getByRole("spinbutton", { name: "Stock for Whole Milk" }));
    await user.type(screen.getByRole("spinbutton", { name: "Stock for Whole Milk" }), "9{Escape}");
    expect(onStockChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit stock for Whole Milk" })).toHaveTextContent("3");

    await user.click(screen.getByRole("button", { name: "Edit stock for Whole Milk" }));
    const input = screen.getByRole("spinbutton", { name: "Stock for Whole Milk" });
    await user.clear(input);
    await user.type(input, "0{Enter}");
    expect(onStockChange).toHaveBeenCalledWith("p2", 0);
  });

  it("rejects empty, negative and decimal values with an inline alert and stays in edit mode", async () => {
    const user = userEvent.setup();
    const { onStockChange } = show();
    await user.click(screen.getByRole("button", { name: "Edit stock for Organic Bananas" }));
    const input = screen.getByRole("spinbutton", { name: "Stock for Organic Bananas" });
    for (const bad of ["", "-3", "2.5"]) {
      await user.clear(input);
      if (bad) await user.type(input, bad);
      await user.type(input, "{Enter}");
      expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole number, 0 or more");
      expect(screen.getByRole("spinbutton", { name: "Stock for Organic Bananas" })).toBeInTheDocument();
    }
    expect(onStockChange).not.toHaveBeenCalled();
  });

  it("always renders the stock from props (controlled by the parent)", () => {
    const { rerender, onStockChange, onBulkUpdate } = show();
    expect(screen.getByRole("button", { name: "Edit stock for Whole Milk" })).toHaveTextContent("3");
    const updated = products.map((p) => (p._id === "p2" ? { ...p, stock: 20 } : p));
    rerender(<AdminProductsTable products={updated} onStockChange={onStockChange} onBulkUpdate={onBulkUpdate} />);
    expect(screen.getByRole("button", { name: "Edit stock for Whole Milk" })).toHaveTextContent("20");
    expect(rowOf("Whole Milk")).not.toHaveTextContent("Low");
  });
});
