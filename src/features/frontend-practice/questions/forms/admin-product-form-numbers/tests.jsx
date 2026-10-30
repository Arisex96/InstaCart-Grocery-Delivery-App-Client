import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import ProductForm from "./src/components/ProductForm";
import { DEFAULT_IMAGE, buildProductPayload, validateProduct } from "./src/lib/productForm";

const price = () => screen.getByLabelText("Price ($)");
const originalPrice = () => screen.getByLabelText("Original price ($)");
const stock = () => screen.getByLabelText("Stock");
const save = () => screen.getByRole("button", { name: /Save|Saving/ });

/** Fills the form; fields set to null are left untouched. */
async function fill(user, { name = "Free Range Eggs", category = "dairy-eggs", p = "4.8", orig = null, s = "18" } = {}) {
  if (name) await user.type(screen.getByLabelText("Name"), name);
  if (category) await user.selectOptions(screen.getByLabelText("Category"), category);
  if (p !== null) await user.type(price(), p);
  if (orig !== null) await user.type(originalPrice(), orig);
  if (s !== null) await user.type(stock(), s);
}

describe("ProductForm inputs", () => {
  it("starts with empty number fields that can be cleared and retyped", async () => {
    const user = userEvent.setup();
    render(<ProductForm onSubmit={fn()} />);
    expect(price()).toHaveValue("");
    expect(stock()).toHaveValue("");

    await user.type(price(), "12");
    expect(price()).toHaveValue("12");
    await user.clear(price());
    expect(price()).toHaveValue("");
    await user.type(price(), "3.5");
    expect(price()).toHaveValue("3.5");
  });

  it("the organic checkbox toggles and sends a real boolean", async () => {
    const user = userEvent.setup();
    const onSubmit = fn();
    render(<ProductForm onSubmit={onSubmit} />);
    const box = screen.getByLabelText("Organic");
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
    await fill(user);
    await user.click(save());
    expect(onSubmit.mock.calls[0][0].isOrganic).toBe(true);
  });
});

describe("ProductForm submit", () => {
  it("rejects a blank price and never calls onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = fn();
    render(<ProductForm onSubmit={onSubmit} />);
    await fill(user, { p: null });
    await user.click(save());
    expect(screen.getByText("Price is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects non-numeric and negative prices, and fractional or negative stock", async () => {
    const user = userEvent.setup();
    const onSubmit = fn();
    render(<ProductForm onSubmit={onSubmit} />);
    await fill(user, { p: "abc", s: "2.5" });
    await user.click(save());
    expect(screen.getByText("Price must be a positive number")).toBeInTheDocument();
    expect(screen.getByText("Stock must be a whole number (0 or more)")).toBeInTheDocument();

    await user.clear(price());
    await user.type(price(), "-1");
    await user.clear(stock());
    await user.type(stock(), "-4");
    await user.click(save());
    expect(screen.getByText("Price must be a positive number")).toBeInTheDocument();
    expect(screen.getByText("Stock must be a whole number (0 or more)")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("sends the payload with trimmed text, cent-rounded prices, integer stock and a boolean flag", async () => {
    const user = userEvent.setup();
    const onSubmit = fn();
    render(<ProductForm onSubmit={onSubmit} />);
    await fill(user, { name: "  Free Range Eggs ", p: "3.456", orig: "4.999", s: "18" });
    await user.click(screen.getByLabelText("Organic"));
    await user.click(save());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Free Range Eggs",
      description: "",
      price: 3.46,
      originalPrice: 5,
      image: DEFAULT_IMAGE,
      category: "dairy-eggs",
      unit: "piece",
      stock: 18,
      isOrganic: true,
      rating: 5,
      reviewCount: 0,
    });
  });

  it("defaults a blank original price to the price and rejects one below the price", async () => {
    const user = userEvent.setup();
    const onSubmit = fn();
    render(<ProductForm onSubmit={onSubmit} />);
    await fill(user, { p: "4.8", orig: "3" });
    await user.click(save());
    expect(screen.getByText("Original price can't be lower than price")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(originalPrice());
    await user.click(save());
    const payload = onSubmit.mock.calls[0][0];
    expect([payload.price, payload.originalPrice, payload.isOrganic]).toEqual([4.8, 4.8, false]);
  });

  it("disables the button while saving and shows the failure message afterwards", async () => {
    const user = userEvent.setup();
    const request = deferred();
    const onSubmit = fn(() => request.promise);
    render(<ProductForm onSubmit={onSubmit} />);
    await fill(user);
    await user.click(save());
    expect(save()).toBeDisabled();

    await act(async () => request.reject({ response: { data: { message: "Product already exists" } } }));
    expect(screen.getByRole("alert")).toHaveTextContent("Product already exists");
    expect(save()).toBeEnabled();
  });
});

describe("validateProduct / buildProductPayload", () => {
  const valid = {
    name: "Milk",
    description: "",
    price: "3.5",
    originalPrice: "",
    category: "dairy-eggs",
    unit: "gal",
    stock: "0",
    isOrganic: false,
  };

  it("accepts a valid form (stock 0 is fine) and reports every invalid field", () => {
    expect(validateProduct(valid)).toEqual({});
    const errors = validateProduct({ ...valid, name: "  ", category: "", price: "0", stock: "" });
    expect(Object.keys(errors).sort()).toEqual(["category", "name", "price", "stock"]);
  });

  it("builds numbers, not strings, for numeric fields", () => {
    const payload = buildProductPayload(valid);
    expect(payload.price).toBe(3.5);
    expect(payload.originalPrice).toBe(3.5);
    expect(payload.stock).toBe(0);
    expect(payload.isOrganic).toBe(false);
  });
});
