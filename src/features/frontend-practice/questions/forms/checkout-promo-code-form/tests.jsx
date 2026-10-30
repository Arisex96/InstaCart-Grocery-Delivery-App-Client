import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PromoCodeForm from "./src/components/PromoCodeForm";

const input = () => screen.getByLabelText("Promo code", { selector: "input" });
const apply = () => screen.getByRole("button", { name: /Appl/ });

describe("PromoCodeForm", () => {
  it("renders a labelled input and an Apply button", () => {
    render(<PromoCodeForm onApply={fn()} />);
    expect(input()).toHaveValue("");
    expect(apply()).toHaveTextContent("Apply");
  });

  it("lets the shopper type a code", async () => {
    const user = userEvent.setup();
    render(<PromoCodeForm onApply={fn()} />);
    await user.type(input(), "fresh10");
    expect(input()).toHaveValue("fresh10");
  });

  it("prevents the page reload on submit", () => {
    render(<PromoCodeForm onApply={fn()} />);
    const form = screen.getByRole("form", { name: "Promo code" });
    // fireEvent returns false when a handler called preventDefault().
    expect(fireEvent.submit(form)).toBe(false);
  });

  it("sends the trimmed, upper-cased code to onApply exactly once", async () => {
    const user = userEvent.setup();
    const onApply = fn();
    render(<PromoCodeForm onApply={onApply} />);
    await user.type(input(), "  fresh10 ");
    await user.click(apply());
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith("FRESH10");
  });

  it("rejects a blank code with an error and never calls onApply", async () => {
    const user = userEvent.setup();
    const onApply = fn();
    render(<PromoCodeForm onApply={onApply} />);
    await user.click(apply());
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a promo code");

    await user.type(input(), "   ");
    await user.click(apply());
    expect(onApply).not.toHaveBeenCalled();
  });

  it("clears the error as soon as the shopper edits the code", async () => {
    const user = userEvent.setup();
    render(<PromoCodeForm onApply={fn()} />);
    await user.click(apply());
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.type(input(), "a");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the message returned by onApply for an invalid code", async () => {
    const user = userEvent.setup();
    render(<PromoCodeForm onApply={() => "Promo code expired"} />);
    await user.type(input(), "old10");
    await user.click(apply());
    expect(screen.getByRole("alert")).toHaveTextContent("Promo code expired");
  });

  it("disables the button and shows Applying… while applying", () => {
    render(<PromoCodeForm onApply={fn()} applying />);
    expect(screen.getByRole("button", { name: "Applying…" })).toBeDisabled();
  });
});
