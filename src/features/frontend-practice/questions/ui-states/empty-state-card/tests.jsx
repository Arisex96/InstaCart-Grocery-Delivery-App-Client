import { fireEvent, render, screen } from "@testing-library/react";
import EmptyState from "./src/components/EmptyState";
import { EmptyCart, NoOrders, NoResults } from "./src/components/emptyStates";

// Tests describe the contract from the UI requirements (roles, headings, copy, buttons), not class names.
describe("EmptyState", () => {
  it("is a status region with an icon slot, an h3 title and a description", () => {
    render(<EmptyState icon={<svg data-testid="icon" />} title="Nothing here" description="Come back later" />);
    const status = screen.getByRole("status");
    expect(screen.getByRole("heading", { level: 3, name: "Nothing here" })).toBeInTheDocument();
    expect(status).toHaveTextContent("Come back later");
    expect(status.contains(screen.getByTestId("icon"))).toBe(true);
    // the decorative icon is hidden from assistive tech
    expect(screen.getByTestId("icon").closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("renders the primary and secondary buttons and calls each callback once", () => {
    const onAction = fn();
    const onSecondary = fn();
    render(
      <EmptyState title="T" actionLabel="Do it" onAction={onAction} secondaryLabel="Maybe later" onSecondary={onSecondary} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Do it" }));
    fireEvent.click(screen.getByRole("button", { name: "Maybe later" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it("omits buttons whose label is not provided", () => {
    render(<EmptyState title="T" description="D" />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    render(<EmptyState title="T2" actionLabel="Only primary" onAction={fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});

describe("EmptyCart", () => {
  it("shows the approved copy and a Continue shopping button", () => {
    const onContinue = fn();
    render(<EmptyCart onContinue={onContinue} />);
    expect(screen.getByRole("heading", { level: 3, name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Looks like you haven't added anything yet. Fresh groceries are a click away.");
    fireEvent.click(screen.getByRole("button", { name: "Continue shopping" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").querySelector("svg")).not.toBeNull();
  });
});

describe("NoResults", () => {
  it("puts the trimmed query in the title", () => {
    render(<NoResults query="  bananas " onClear={fn()} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent('No results for "bananas"');
    expect(screen.getByRole("status")).toHaveTextContent("Try a different spelling, or clear your filters to see everything.");
  });

  it("falls back to a generic title for a missing or blank query", () => {
    const { rerender } = render(<NoResults onClear={fn()} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("No products found");
    rerender(<NoResults query="   " onClear={fn()} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("No products found");
  });

  it("only offers Clear filters when onClear is given, and calls it once", () => {
    const { rerender } = render(<NoResults query="x" />);
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
    const onClear = fn();
    rerender(<NoResults query="x" onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("NoOrders", () => {
  it("shows the copy, a Start shopping button and an optional Need help link", () => {
    const onBrowse = fn();
    const onSupport = fn();
    const { rerender } = render(<NoOrders onBrowse={onBrowse} />);
    expect(screen.getByRole("heading", { level: 3, name: "No orders yet" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("When you place an order it will show up here so you can track it.");
    expect(screen.queryByRole("button", { name: "Need help?" })).not.toBeInTheDocument();

    rerender(<NoOrders onBrowse={onBrowse} onSupport={onSupport} />);
    fireEvent.click(screen.getByRole("button", { name: "Start shopping" }));
    fireEvent.click(screen.getByRole("button", { name: "Need help?" }));
    expect(onBrowse).toHaveBeenCalledTimes(1);
    expect(onSupport).toHaveBeenCalledTimes(1);
  });
});
