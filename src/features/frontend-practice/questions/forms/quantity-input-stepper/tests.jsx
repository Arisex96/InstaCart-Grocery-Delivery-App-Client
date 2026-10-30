import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import QuantityInput from "./src/components/QuantityInput";

// A tiny parent that owns the value, like the cart does. Typing uses fireEvent.change and blur uses
// fireEvent.blur so the tests do not depend on browser focus behaviour.
function Parent({ initial = 2, min = 1, max = 5, onChange = () => {} }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <QuantityInput
        value={value}
        min={min}
        max={max}
        onChange={(n) => {
          setValue(n);
          onChange(n);
        }}
      />
      <button onClick={() => setValue(4)}>parent sets 4</button>
    </>
  );
}

const input = () => screen.getByLabelText("Quantity");
const type = (text) => fireEvent.change(input(), { target: { value: text } });
const blur = () => fireEvent.blur(input());

describe("QuantityInput", () => {
  it("renders a labelled group, the quantity input and both buttons", () => {
    render(<Parent initial={2} />);
    expect(screen.getByRole("group", { name: "Quantity selector" })).toBeInTheDocument();
    expect(input()).toHaveValue("2");
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeInTheDocument();
  });

  it("plus and minus call onChange with value ± 1", () => {
    const onChange = fn();
    render(<Parent initial={3} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(input()).toHaveValue("3");
  });

  it("disables minus at the minimum and plus at the maximum", () => {
    const { unmount } = render(<Parent initial={1} max={3} />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeEnabled();
    unmount();
    render(<Parent initial={3} max={3} />);
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeEnabled();
  });

  it("announces the stock limit when the maximum is reached", () => {
    const { unmount } = render(<Parent initial={3} max={3} />);
    expect(screen.getByRole("status")).toHaveTextContent("Only 3 in stock");
    unmount();
    render(<Parent initial={2} max={3} />);
    expect(screen.queryByText(/in stock/)).not.toBeInTheDocument();
  });

  it("does not announce a stock limit when there is no maximum", () => {
    render(<QuantityInput value={9} onChange={() => {}} />);
    expect(screen.queryByText(/in stock/)).not.toBeInTheDocument();
  });

  it("calls onChange with typed integers inside the range, never with partial input", () => {
    const onChange = fn();
    render(<Parent initial={2} max={5} onChange={onChange} />);
    type("");
    type("abc");
    type("1.5");
    type("99");
    expect(onChange).not.toHaveBeenCalled();
    type("4");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(onChange.mock.calls.every(([n]) => Number.isInteger(n) && n >= 1 && n <= 5)).toBe(true);
  });

  it("clamps a too-large number to the maximum on blur", () => {
    const onChange = fn();
    render(<Parent initial={2} max={5} onChange={onChange} />);
    type("99");
    blur();
    expect(input()).toHaveValue("5");
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(onChange.mock.calls.every(([n]) => n <= 5)).toBe(true);
  });

  it("clamps below the minimum to the minimum on blur", () => {
    const onChange = fn();
    render(<Parent initial={3} min={1} max={5} onChange={onChange} />);
    type("0");
    blur();
    expect(input()).toHaveValue("1");
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("clamps to the maximum even when the parent value is already the maximum", () => {
    const onChange = fn();
    render(<Parent initial={5} max={5} onChange={onChange} />);
    type("99");
    expect(input()).toHaveValue("99"); // the draft is visible until blur
    blur();
    expect(input()).toHaveValue("5");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reverts invalid or empty text to the current value on blur", () => {
    const onChange = fn();
    render(<Parent initial={3} onChange={onChange} />);
    type("");
    expect(input()).toHaveValue(""); // the shopper can clear the box while typing
    blur();
    expect(input()).toHaveValue("3");
    type("abc");
    expect(input()).toHaveValue("abc");
    blur();
    expect(input()).toHaveValue("3");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the new value when the parent changes it", () => {
    render(<Parent initial={2} max={5} />);
    fireEvent.click(screen.getByText("parent sets 4"));
    expect(input()).toHaveValue("4");
  });
});
