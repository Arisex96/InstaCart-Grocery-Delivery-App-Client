import { fireEvent, render, screen } from "@testing-library/react";
import WishlistButton from "./src/components/WishlistButton";
import WishlistCount from "./src/components/WishlistCount";

// Tests describe the contract from the UI requirements (roles, names, aria), not class names.
const product = { _id: "p1", name: "Organic Bananas" };

describe("WishlistButton", () => {
  it("is a button with aria-pressed=false and an Add accessible name when not saved", () => {
    render(<WishlistButton product={product} isSaved={false} onToggle={fn()} />);
    const button = screen.getByRole("button", { name: "Add Organic Bananas to wishlist" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("has aria-pressed=true and a Remove accessible name when saved", () => {
    render(<WishlistButton product={product} isSaved onToggle={fn()} />);
    expect(screen.getByRole("button", { name: "Remove Organic Bananas from wishlist" })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle once with the product id on click", () => {
    const onToggle = fn();
    render(<WishlistButton product={product} isSaved={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("p1");
  });

  it("does not bubble the click to a clickable parent card", () => {
    const onCard = fn();
    render(
      <div onClick={onCard}>
        <WishlistButton product={product} isSaved={false} onToggle={fn()} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onCard).not.toHaveBeenCalled();
  });

  it("is controlled: it follows isSaved when the parent changes it, without its own state", () => {
    const { rerender } = render(<WishlistButton product={product} isSaved={false} onToggle={fn()} />);
    fireEvent.click(screen.getByRole("button"));
    // the parent has not changed isSaved, so nothing may flip on its own
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    rerender(<WishlistButton product={product} isSaved onToggle={fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });
});

describe("WishlistCount", () => {
  it("shows the number of saved items with a plural status label", () => {
    render(<WishlistCount savedIds={["p1", "p2", "p3"]} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Wishlist: 3 items");
    expect(status).toHaveTextContent("3");
  });

  it("uses the singular label for one item", () => {
    render(<WishlistCount savedIds={["p1"]} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Wishlist: 1 item");
  });

  it("says empty and renders no numeric badge when nothing is saved", () => {
    render(<WishlistCount savedIds={[]} />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Wishlist: empty");
    expect(status.textContent).not.toMatch(/\d/);
  });

  it("counts each distinct id once (count of distinct ids)", () => {
    render(<WishlistCount savedIds={["p1", "p1", "p2", "p2", "p2"]} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Wishlist: 2 items");
  });

  it("caps the badge at 9+ above nine, but not at exactly nine", () => {
    const ids = (n) => Array.from({ length: n }, (_, i) => "p" + i);
    const { rerender } = render(<WishlistCount savedIds={ids(9)} />);
    expect(screen.getByRole("status")).toHaveTextContent("9");
    expect(screen.getByRole("status")).not.toHaveTextContent("9+");
    rerender(<WishlistCount savedIds={ids(10)} />);
    expect(screen.getByRole("status")).toHaveTextContent("9+");
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Wishlist: 10 items");
  });
});
