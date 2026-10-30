import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import CheckoutForm from "./src/components/CheckoutForm";
import { validateField, validateForm } from "./src/lib/checkoutValidation";

// The tests check the contract from the UI requirements (labels, exact messages, aria attributes,
// payload, states), never class names or DOM structure, so any valid implementation passes.
const ITEMS = [
  { product: { _id: "a", name: "A", price: 10 }, quantity: 2 },
  { product: { _id: "b", name: "B", price: 1.2 }, quantity: 3 },
]; // 5 units, $23.60

const VALID = {
  "Full name": "Ana Perez",
  "Street address": "12 Main St",
  City: "Austin",
  "ZIP code": "73301",
  "Phone number": "(555) 123-4567",
};

const field = (label) => screen.getByLabelText(label);
const placeButton = () => screen.getByRole("button", { name: /Place order|Placing order/ });
const figure = (label) => screen.getByText(label, { selector: "dt" }).nextElementSibling.textContent.trim();

async function fill(user, values = VALID) {
  for (const [label, text] of Object.entries(values)) await user.type(field(label), text);
}

const setup = (placeOrder = fn().mockResolvedValue({ id: "A1B2" })) => {
  const user = userEvent.setup();
  render(<CheckoutForm items={ITEMS} placeOrder={placeOrder} />);
  return { user, placeOrder };
};

describe("CheckoutForm layout", () => {
  it("renders the labelled fields and payment radios, with the card number hidden by default", async () => {
    const { user } = setup();
    expect(screen.getByRole("form", { name: "Checkout" })).toBeInTheDocument();
    for (const label of Object.keys(VALID)) expect(field(label)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Cash on delivery" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Card" })).not.toBeChecked();
    expect(screen.queryByLabelText("Card number")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Card" }));
    expect(field("Card number")).toBeInTheDocument();
  });

  it("shows the order total and unit count from the items", () => {
    setup();
    expect(figure("Items")).toBe("5");
    expect(figure("Total")).toBe("$23.60"); // 2 × 10 + 3 × 1.2 without floating point noise
  });
});

describe("CheckoutForm validation", () => {
  it("shows an error after blur, wires it with aria and clears it when fixed", async () => {
    const { user } = setup();
    expect(screen.queryByText("Enter your full name")).not.toBeInTheDocument(); // not before interaction

    await user.click(field("Full name"));
    await user.tab(); // blur
    const message = screen.getByText("Enter your full name");
    expect(message).toHaveAttribute("role", "alert");
    expect(field("Full name")).toHaveAttribute("aria-invalid", "true");
    expect(field("Full name").getAttribute("aria-describedby")).toBe(message.id);
    expect(message.id).not.toBe("");

    await user.type(field("Full name"), "Ana");
    expect(screen.queryByText("Enter your full name")).not.toBeInTheDocument();
    expect(field("Full name")).not.toHaveAttribute("aria-invalid", "true");
    expect(field("Full name")).not.toHaveAttribute("aria-describedby");
  });

  it("validates the ZIP code and the phone number formats", async () => {
    const { user } = setup();
    await user.type(field("ZIP code"), "1234");
    await user.tab();
    expect(screen.getByText("ZIP code must be 5 digits")).toBeInTheDocument();
    await user.type(field("ZIP code"), "5");
    expect(screen.queryByText("ZIP code must be 5 digits")).not.toBeInTheDocument();

    await user.type(field("Phone number"), "12345");
    await user.tab();
    expect(screen.getByText("Enter a valid phone number")).toBeInTheDocument();
    await user.clear(field("Phone number"));
    await user.type(field("Phone number"), "(555) 123-4567");
    expect(screen.queryByText("Enter a valid phone number")).not.toBeInTheDocument();
  });

  it("validates the card number ignoring spaces", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "Card" }));
    await user.type(field("Card number"), "4242");
    await user.tab();
    expect(screen.getByText("Card number must be 16 digits")).toBeInTheDocument();
    await user.clear(field("Card number"));
    await user.type(field("Card number"), "4242 4242 4242 4242");
    expect(screen.queryByText("Card number must be 16 digits")).not.toBeInTheDocument();
  });

  it("an invalid form shows every error on submit and never calls placeOrder", async () => {
    const { user, placeOrder } = setup();
    await user.click(placeButton());
    for (const message of [
      "Enter your full name",
      "Enter your street address",
      "Enter your city",
      "Enter your ZIP code",
      "Enter your phone number",
    ]) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
    expect(placeOrder).not.toHaveBeenCalled();
  });

  it("validateField returns the exact messages (and nothing for valid values)", () => {
    expect(validateField("name", "  ")).toBe("Enter your full name");
    expect(validateField("address", "")).toBe("Enter your street address");
    expect(validateField("city", "")).toBe("Enter your city");
    expect(validateField("zip", "")).toBe("Enter your ZIP code");
    expect(validateField("zip", "12a45")).toBe("ZIP code must be 5 digits");
    expect(validateField("zip", "123456")).toBe("ZIP code must be 5 digits");
    expect(validateField("zip", " 73301 ")).toBe("");
    expect(validateField("phone", "")).toBe("Enter your phone number");
    expect(validateField("phone", "12345")).toBe("Enter a valid phone number");
    expect(validateField("phone", "(555) 123-4567")).toBe("");
    expect(validateField("cardNumber", "")).toBe("Enter your card number");
    expect(validateField("cardNumber", "4242")).toBe("Card number must be 16 digits");
    expect(validateField("cardNumber", "4242 4242 4242 4242")).toBe("");
  });

  it("validateForm reports only failing fields and checks the card number only for card payments", () => {
    const base = { name: "Ana", address: "1 St", city: "X", zip: "73301", phone: "5551234567", payment: "cod", cardNumber: "" };
    expect(validateForm(base)).toEqual({});
    expect(validateForm({ ...base, zip: "1", city: "" })).toEqual({
      zip: "ZIP code must be 5 digits",
      city: "Enter your city",
    });
    expect(validateForm({ ...base, payment: "card", cardNumber: "12" })).toEqual({
      cardNumber: "Card number must be 16 digits",
    });
  });
});

describe("CheckoutForm submit flow", () => {
  it("calls placeOrder once with the trimmed payload for a cash order", async () => {
    const { user, placeOrder } = setup();
    await fill(user, { ...VALID, "Full name": "  Ana Perez  ", City: " Austin " });
    await user.click(placeButton());
    expect(placeOrder).toHaveBeenCalledTimes(1);
    const payload = placeOrder.mock.calls[0][0];
    expect(payload).toEqual({
      name: "Ana Perez",
      address: "12 Main St",
      city: "Austin",
      zip: "73301",
      phone: "(555) 123-4567",
      payment: "cod",
      total: 23.6,
    });
    expect("cardNumber" in payload).toBe(false);
  });

  it("sends only the digits of the card number for card payments", async () => {
    const { user, placeOrder } = setup();
    await fill(user);
    await user.click(screen.getByRole("radio", { name: "Card" }));
    await user.type(field("Card number"), "4242 4242 4242 4242");
    await user.click(placeButton());
    expect(placeOrder).toHaveBeenCalledTimes(1);
    expect(placeOrder.mock.calls[0][0].cardNumber).toBe("4242424242424242");
    expect(placeOrder.mock.calls[0][0].payment).toBe("card");
  });

  it("a hidden invalid card number does not block a cash order and is not sent", async () => {
    const { user, placeOrder } = setup();
    await fill(user);
    await user.click(screen.getByRole("radio", { name: "Card" }));
    await user.type(field("Card number"), "12");
    await user.click(screen.getByRole("radio", { name: "Cash on delivery" }));
    expect(screen.queryByLabelText("Card number")).not.toBeInTheDocument();

    await user.click(placeButton());
    expect(placeOrder).toHaveBeenCalledTimes(1);
    expect("cardNumber" in placeOrder.mock.calls[0][0]).toBe(false);
  });

  it("disables the button while pending and ignores further submits", async () => {
    const request = deferred();
    const placeOrder = fn(() => request.promise);
    const { user } = setup(placeOrder);
    await fill(user);
    await user.click(placeButton());

    expect(screen.getByRole("button", { name: "Placing order…" })).toBeDisabled();
    const form = screen.getByRole("form", { name: "Checkout" });
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(placeOrder).toHaveBeenCalledTimes(1);

    await act(async () => request.resolve({ id: "Z9" }));
  });

  it("two submit events in the same tick place only one order", async () => {
    const placeOrder = fn(() => new Promise(() => {}));
    const { user } = setup(placeOrder);
    await fill(user);
    const form = screen.getByRole("form", { name: "Checkout" });
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(placeOrder).toHaveBeenCalledTimes(1);
  });

  it("shows the success state with the order id and removes the form", async () => {
    const { user } = setup(fn().mockResolvedValue({ id: "A1B2" }));
    await fill(user);
    await user.click(placeButton());
    expect(await screen.findByRole("status")).toHaveTextContent("Order placed! #A1B2");
    expect(screen.queryByRole("form", { name: "Checkout" })).not.toBeInTheDocument();
  });

  it("keeps the typed values on failure, shows the error and lets the shopper retry", async () => {
    const placeOrder = fn()
      .mockImplementation(() => Promise.reject(new Error("Payment service unavailable")));
    const { user } = setup(placeOrder);
    await fill(user);
    await user.click(placeButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not place order");
    expect(field("Full name")).toHaveValue("Ana Perez");
    expect(field("ZIP code")).toHaveValue("73301");
    expect(screen.getByRole("button", { name: "Place order" })).toBeEnabled();

    placeOrder.mockImplementation(() => Promise.resolve({ id: "R2" }));
    await user.click(screen.getByRole("button", { name: "Place order" }));
    expect(placeOrder).toHaveBeenCalledTimes(2);
    expect(placeOrder.mock.calls[1][0]).toEqual(placeOrder.mock.calls[0][0]);
    expect(await screen.findByRole("status")).toHaveTextContent("Order placed! #R2");
  });
});
