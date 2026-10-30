import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryChipBar from "./src/components/CategoryChipBar";

// The contract is in the UI requirements: roles, labels, text and aria attributes.
const categories = [
  { slug: "bakery", name: "Bakery" },
  { slug: "snacks", name: "Snacks" },
  { slug: "frozen-foods", name: "Frozen Foods" },
];
const p = (id, category) => ({ _id: id, category });
const products = [p("1", "bakery"), p("2", "bakery"), p("3", "snacks")];

const chip = (name) => screen.getByRole("button", { name });
const bar = () => screen.getByRole("group", { name: "Categories" });

describe("structure", () => {
  it("renders a Categories group with All first, then one chip per category in order", () => {
    render(<CategoryChipBar categories={categories} products={products} onChange={fn()} />);
    const labels = Array.from(bar().querySelectorAll("button")).map((b) => b.textContent.trim());
    expect(labels).toEqual(["All (3)", "Bakery (2)", "Snacks (1)", "Frozen Foods (0)"]);
  });

  it("counts products per category and updates when the products change", () => {
    const { rerender } = render(<CategoryChipBar categories={categories} products={products} onChange={fn()} />);
    expect(chip("Bakery (2)")).toBeInTheDocument();
    rerender(<CategoryChipBar categories={categories} products={[...products, p("4", "bakery"), p("5", "mystery")]} onChange={fn()} />);
    expect(chip("Bakery (3)")).toBeInTheDocument();
    expect(chip("All (5)")).toBeInTheDocument(); // unknown categories still count toward All only
  });

  it("shows an empty catalogue as All (0) with every category at 0", () => {
    render(<CategoryChipBar categories={categories} products={[]} onChange={fn()} />);
    expect(chip("All (0)")).toBeEnabled();
    expect(chip("Snacks (0)")).toBeDisabled();
  });
});

describe("active state", () => {
  it("marks All as pressed by default and every other chip as not pressed", () => {
    render(<CategoryChipBar categories={categories} products={products} onChange={fn()} />);
    expect(chip("All (3)")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Bakery (2)")).toHaveAttribute("aria-pressed", "false");
  });

  it("marks only the chip matching the active prop as pressed", () => {
    render(<CategoryChipBar categories={categories} products={products} active="snacks" onChange={fn()} />);
    expect(chip("Snacks (1)")).toHaveAttribute("aria-pressed", "true");
    expect(chip("All (3)")).toHaveAttribute("aria-pressed", "false");
    expect(chip("Bakery (2)")).toHaveAttribute("aria-pressed", "false");
  });
});

describe("interaction", () => {
  it("calls onChange with the slug when a category chip is clicked", async () => {
    const onChange = fn();
    render(<CategoryChipBar categories={categories} products={products} onChange={onChange} />);
    await userEvent.click(chip("Bakery (2)"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("bakery");
  });

  it("calls onChange with \"all\" for the All chip", async () => {
    const onChange = fn();
    render(<CategoryChipBar categories={categories} products={products} active="bakery" onChange={onChange} />);
    await userEvent.click(chip("All (3)"));
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("disables categories without products and never calls onChange for them", async () => {
    const onChange = fn();
    render(<CategoryChipBar categories={categories} products={products} onChange={onChange} />);
    expect(chip("Frozen Foods (0)")).toBeDisabled();
    await userEvent.click(chip("Frozen Foods (0)"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is controlled: clicking does not change the pressed chip by itself", async () => {
    render(<CategoryChipBar categories={categories} products={products} active="all" onChange={fn()} />);
    await userEvent.click(chip("Snacks (1)"));
    expect(chip("All (3)")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Snacks (1)")).toHaveAttribute("aria-pressed", "false");
  });
});
