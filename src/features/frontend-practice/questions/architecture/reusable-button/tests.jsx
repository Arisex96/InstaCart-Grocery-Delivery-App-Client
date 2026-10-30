import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./src/components/ui/Button";

describe("Button", () => {
  it("renders its children inside a native button", () => {
    render(<Button>Clear All Filters</Button>);
    expect(screen.getByRole("button", { name: "Clear All Filters" })).toBeInTheDocument();
  });

  it("forwards onClick, aria-label and other native props", () => {
    const onClick = fn();
    render(
      <Button onClick={onClick} aria-label="Open filters" data-testid="b" title="Filters">
        Filters
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Open filters" });
    expect(button).toHaveAttribute("title", "Filters");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges a caller className with the variant classes", () => {
    render(<Button className="w-full mt-4">Go</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full", "mt-4");
    expect(button).toHaveClass("bg-app-green");
    expect(button.className).not.toContain("undefined");
  });

  it("keeps a distinct look for each variant", () => {
    render(
      <div>
        <Button variant="primary">P</Button>
        <Button variant="secondary">S</Button>
        <Button variant="danger">D</Button>
      </div>,
    );
    expect(screen.getByText("P")).toHaveClass("bg-app-green");
    expect(screen.getByText("S")).toHaveClass("border-app-border");
    expect(screen.getByText("D")).toHaveClass("bg-red-500");
  });

  it("defaults type to button so it never submits a form by accident", () => {
    const onSubmit = fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Apply</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it("still submits when type=submit is requested explicitly", () => {
    const onSubmit = fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Place order</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Place order" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("blocks clicks and shows a spinner with aria-busy while loading", () => {
    const onClick = fn();
    const { container } = render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(0);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = fn();
    render(
      <Button disabled onClick={onClick}>
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(0);
  });
});
