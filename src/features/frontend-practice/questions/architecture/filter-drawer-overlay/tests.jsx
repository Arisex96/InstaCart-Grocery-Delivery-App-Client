import { render, screen, fireEvent } from "@testing-library/react";
import FilterDrawer from "./src/components/FilterDrawer";

// Track the keydown listeners that are registered on window while a test runs.
const addListener = window.addEventListener;
const removeListener = window.removeEventListener;
let active;

beforeEach(() => {
  active = [];
  window.addEventListener = (type, handler, options) => {
    if (type === "keydown") active.push(handler);
    return addListener.call(window, type, handler, options);
  };
  window.removeEventListener = (type, handler, options) => {
    if (type === "keydown") active = active.filter((h) => h !== handler);
    return removeListener.call(window, type, handler, options);
  };
});
afterEach(() => {
  window.addEventListener = addListener;
  window.removeEventListener = removeListener;
});

const drawer = (props = {}) => (
  <FilterDrawer open onClose={() => {}} title="Filter Options" {...props}>
    <button>Bakery</button>
    <p>Categories</p>
  </FilterDrawer>
);

describe("FilterDrawer", () => {
  it("renders nothing while closed, and the title and children while open", () => {
    const view = render(drawer({ open: false }));
    expect(screen.queryByText("Filter Options")).not.toBeInTheDocument();
    view.rerender(drawer({ open: true }));
    expect(screen.getByText("Filter Options")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bakery" })).toBeInTheDocument();
  });

  it("exposes dialog semantics: role, aria-modal and a name from the heading", () => {
    render(drawer());
    const dialog = screen.getByRole("dialog", { name: "Filter Options" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape while open", () => {
    const onClose = fn();
    render(drawer({ onClose }));
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const onClose = fn();
    render(drawer({ onClose }));
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it("does not react to Escape while closed", () => {
    const onClose = fn();
    render(drawer({ open: false, onClose }));
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it("closes when the backdrop is clicked", () => {
    const onClose = fn();
    render(drawer({ onClose }));
    fireEvent.click(screen.getByTestId("drawer-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when something inside the panel is clicked", () => {
    const onClose = fn();
    render(drawer({ onClose }));
    fireEvent.click(screen.getByRole("button", { name: "Bakery" }));
    fireEvent.click(screen.getByText("Categories"));
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it("close button calls onClose exactly once", () => {
    const onClose = fn();
    render(drawer({ onClose }));
    fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("removes its keydown listener when closed or unmounted, without piling up", () => {
    const view = render(drawer());
    view.rerender(drawer({ title: "Filter Options!" })); // re-render while open
    expect(active).toHaveLength(1);
    view.rerender(drawer({ open: false }));
    expect(active).toHaveLength(0);
    view.rerender(drawer({ open: true }));
    expect(active).toHaveLength(1);
    view.unmount();
    expect(active).toHaveLength(0);
  });
});
