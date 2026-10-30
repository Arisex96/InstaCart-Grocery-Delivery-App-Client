import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductDetailPanel from "./src/components/ProductDetailPanel";
import { products } from "./src/data/products";

// Tests check the contract in the UI requirements (roles, labels, text), not class names.
const [bananas, milk, avocados] = products; // stock 40 / 3 / 0
const oil = products[11]; // description is null
const IMAGES = ["img-a", "img-b", "img-c"];
const REVIEWS = [
  { _id: "r1", name: "Priya", rating: 5, comment: "Perfectly ripe." },
  { _id: "r2", name: "Marcus", rating: 4, comment: "Great later." },
];

const show = (product = bananas, props = {}) =>
  render(<ProductDetailPanel product={product} images={IMAGES} reviews={[]} onAdd={fn()} {...props} />);
const qty = () => screen.getByRole("status", { name: "Quantity" });
const tab = (name) => screen.getByRole("tab", { name });

describe("info block", () => {
  it("shows the name heading, the main image, rating and price", () => {
    show();
    expect(screen.getByRole("heading", { name: "Organic Bananas", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Organic Bananas" })).toHaveAttribute("src", "img-a");
    expect(screen.getByText("4.7 (212 reviews)")).toBeInTheDocument();
    expect(screen.getByText("$1.20")).toBeInTheDocument();
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
  });

  it("shows the struck-through original price and the badge only for discounted products", () => {
    show(milk);
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
    expect(screen.getByText("$4.40").closest("s, del")).not.toBeNull();
    expect(screen.getByText("$3.50").closest("s, del")).toBeNull();
  });

  it("uses the singular for a single review", () => {
    show({ ...bananas, reviewCount: 1 });
    expect(screen.getByText("4.7 (1 review)")).toBeInTheDocument();
  });
});

describe("gallery", () => {
  it("renders one pressed-state thumbnail button per image and swaps the main image", async () => {
    const user = userEvent.setup();
    show();
    const group = screen.getByRole("group", { name: "Product images" });
    const thumbs = within(group).getAllByRole("button");
    expect(thumbs.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Show image 1 of 3",
      "Show image 2 of 3",
      "Show image 3 of 3",
    ]);
    expect(thumbs[0]).toHaveAttribute("aria-pressed", "true");
    await user.click(thumbs[2]);
    expect(screen.getByRole("img", { name: "Organic Bananas" })).toHaveAttribute("src", "img-c");
    expect(thumbs[2]).toHaveAttribute("aria-pressed", "true");
    expect(thumbs[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("falls back to the product image when no gallery images are given", () => {
    show(bananas, { images: [] });
    expect(screen.getByRole("img", { name: "Organic Bananas" })).toHaveAttribute("src", bananas.image);
  });
});

describe("quantity stepper and add to cart", () => {
  it("starts at 1, cannot go below 1 and cannot exceed the stock", async () => {
    const user = userEvent.setup();
    show(milk); // stock 3
    expect(qty()).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(qty()).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(qty()).toHaveTextContent("2");
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  it("calls onAdd once with the product and quantity, confirms and resets to 1", async () => {
    const user = userEvent.setup();
    const onAdd = fn();
    show(bananas, { onAdd });
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(bananas, 3);
    expect(screen.getByRole("status", { name: "Cart message" })).toHaveTextContent("Added 3 × Organic Bananas to cart");
    expect(qty()).toHaveTextContent("1");
  });

  it("disables everything and never calls onAdd for a sold out product (out of stock)", async () => {
    const user = userEvent.setup();
    const onAdd = fn();
    show(avocados, { onAdd });
    const button = screen.getByRole("button", { name: "Out of stock" });
    expect(button).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    await user.click(button);
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe("tabs", () => {
  it("exposes the ARIA tabs structure with Description selected first", () => {
    show(bananas, { reviews: REVIEWS });
    expect(screen.getByRole("tablist", { name: "Product information" })).toBeInTheDocument();
    expect(tab("Description")).toHaveAttribute("aria-selected", "true");
    expect(tab("Description")).toHaveAttribute("tabindex", "0");
    expect(tab("Details")).toHaveAttribute("aria-selected", "false");
    expect(tab("Details")).toHaveAttribute("tabindex", "-1");
    expect(tab("Reviews (2)")).toBeInTheDocument();
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.getByRole("tabpanel", { name: "Description" })).toHaveTextContent("Sweet ripe bananas");
  });

  it("shows the details list and the reviews when their tabs are clicked", async () => {
    const user = userEvent.setup();
    show(bananas, { reviews: REVIEWS });
    await user.click(tab("Details"));
    const panel = screen.getByRole("tabpanel", { name: "Details" });
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    const row = (label) => within(panel).getByText(label, { selector: "dt" }).nextElementSibling.textContent;
    expect(row("Unit")).toBe("1 lb");
    expect(row("Category")).toBe("Fruits & Vegetables");
    expect(row("Organic")).toBe("Yes");
    expect(row("Availability")).toBe("40 in stock");

    await user.click(tab("Reviews (2)"));
    const reviews = screen.getByRole("tabpanel", { name: /Reviews/ });
    expect(within(reviews).getAllByRole("listitem")).toHaveLength(2);
    expect(reviews).toHaveTextContent("Rated 5 out of 5");
    expect(reviews).toHaveTextContent("Perfectly ripe.");
  });

  it("moves the selection with ArrowRight / ArrowLeft (wrapping), Home and End", () => {
    show();
    const selected = () => screen.getAllByRole("tab").find((t) => t.getAttribute("aria-selected") === "true").textContent;
    fireEvent.keyDown(tab("Description"), { key: "ArrowRight" });
    expect(selected()).toBe("Details");
    fireEvent.keyDown(tab("Details"), { key: "ArrowRight" });
    expect(selected()).toMatch(/^Reviews/);
    fireEvent.keyDown(screen.getByRole("tab", { name: /Reviews/ }), { key: "ArrowRight" });
    expect(selected()).toBe("Description"); // wraps
    fireEvent.keyDown(tab("Description"), { key: "ArrowLeft" });
    expect(selected()).toMatch(/^Reviews/); // wraps backwards
    fireEvent.keyDown(screen.getByRole("tab", { name: /Reviews/ }), { key: "Home" });
    expect(selected()).toBe("Description");
    fireEvent.keyDown(tab("Description"), { key: "End" });
    expect(selected()).toMatch(/^Reviews/);
  });

  it("falls back gracefully for a missing description and no reviews", async () => {
    const user = userEvent.setup();
    show(oil);
    expect(screen.getByText("No description available.")).toBeInTheDocument();
    await user.click(tab("Reviews (0)"));
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });
});

describe("changing product", () => {
  it("resets the image, quantity, message and tab when another product is shown", async () => {
    const user = userEvent.setup();
    const { rerender } = show(bananas);
    await user.click(screen.getByRole("button", { name: "Show image 2 of 3" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    await user.click(tab("Details"));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    rerender(<ProductDetailPanel product={milk} images={["m-1", "m-2"]} reviews={[]} onAdd={fn()} />);
    expect(screen.getByRole("img", { name: "Whole Milk" })).toHaveAttribute("src", "m-1");
    expect(screen.getByRole("button", { name: "Show image 1 of 2" })).toHaveAttribute("aria-pressed", "true");
    expect(qty()).toHaveTextContent("1");
    expect(screen.queryByRole("status", { name: "Cart message" })).not.toBeInTheDocument();
    expect(tab("Description")).toHaveAttribute("aria-selected", "true");
  });
});
