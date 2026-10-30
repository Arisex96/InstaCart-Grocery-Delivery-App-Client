import { act, fireEvent, render, screen } from "@testing-library/react";
import { deferred } from "./testing/utils";
import CheckoutWizard from "./src/components/CheckoutWizard";
import useCartStore from "./src/store/useCartStore";
import api from "./src/api/axios";
import { products } from "./src/data/products";

// Every POST /orders parks on a promise the test settles by hand.
const realPost = api.post;
let orders;
beforeEach(() => {
  orders = [];
  api.post = (url, body) => {
    const request = deferred();
    orders.push({ url, body, ...request });
    return request.promise;
  };
  const store = useCartStore.getState();
  store.clear_cart();
  store.add_item(products[0], 2); // 2 × $1.20
  store.add_item(products[3], 1); // 1 × $2.25
});
afterEach(() => {
  api.post = realPost;
});

const field = (label) => screen.getByLabelText(label);
const type = (label, value) => fireEvent.change(field(label), { target: { value } });
const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const heading = () => screen.getByRole("heading", { level: 2 });

const fillAddress = () => {
  type("Full name", "Ana Shopper");
  type("Street address", "1 Market St");
  type("City", "Springfield");
  type("ZIP code", "12345");
};
const toDelivery = () => {
  fillAddress();
  click("Next");
};
const toReview = () => {
  toDelivery();
  fireEvent.click(screen.getByLabelText("Tomorrow 8–10 am"));
  click("Next");
};

describe("CheckoutWizard", () => {
  it("starts on the address step with Next and no Back button", () => {
    render(<CheckoutWizard />);
    expect(heading()).toHaveTextContent("Step 1 of 3: Address");
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("blocks Next and shows field errors when the address is incomplete", () => {
    render(<CheckoutWizard />);
    click("Next");
    expect(heading()).toHaveTextContent("Step 1 of 3");
    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
    expect(screen.getByText("Enter a 5-digit ZIP code")).toBeInTheDocument();
  });

  it("rejects a ZIP code that is not 5 digits and accepts it once fixed", () => {
    render(<CheckoutWizard />);
    fillAddress();
    type("ZIP code", "1234");
    click("Next");
    expect(heading()).toHaveTextContent("Step 1 of 3");
    expect(screen.getByText("Enter a 5-digit ZIP code")).toBeInTheDocument();
    type("ZIP code", "12345");
    click("Next");
    expect(heading()).toHaveTextContent("Step 2 of 3: Delivery");
  });

  it("blocks Next without a delivery slot, then lets the shopper continue after choosing one", () => {
    render(<CheckoutWizard />);
    toDelivery();
    click("Next");
    expect(heading()).toHaveTextContent("Step 2 of 3");
    expect(screen.getByText("Choose a delivery slot")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Today 6–8 pm"));
    expect(screen.queryByText("Choose a delivery slot")).not.toBeInTheDocument();
    click("Next");
    expect(heading()).toHaveTextContent("Step 3 of 3: Review");
  });

  it("keeps the address when going back from the delivery step", () => {
    render(<CheckoutWizard />);
    toDelivery();
    click("Back");
    expect(heading()).toHaveTextContent("Step 1 of 3");
    expect(field("Full name")).toHaveValue("Ana Shopper");
    expect(field("ZIP code")).toHaveValue("12345");
  });

  it("keeps the chosen slot when going back from the review step", () => {
    render(<CheckoutWizard />);
    toReview();
    expect(screen.getByText(/Tomorrow 8–10 am/)).toBeInTheDocument();
    click("Back");
    expect(screen.getByLabelText("Tomorrow 8–10 am")).toBeChecked();
  });

  it("sends the order only once even if Place order is clicked twice", async () => {
    render(<CheckoutWizard />);
    toReview();
    const button = screen.getByRole("button", { name: "Place order" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(orders.filter((o) => o.url === "/orders")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Placing order…" })).toBeDisabled();
  });

  it("shows an error after a failed order, re-enables the button and keeps the cart", async () => {
    render(<CheckoutWizard />);
    toReview();
    click("Place order");
    await act(async () => {
      orders[0].reject(new Error("500"));
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Could not place your order");
    expect(screen.getByRole("button", { name: "Place order" })).toBeEnabled();
    expect(useCartStore.getState().total_items).toBe(3);
  });

  it("can retry after a failure: sends the order data, clears the cart and confirms", async () => {
    render(<CheckoutWizard />);
    toReview();
    click("Place order");
    await act(async () => {
      orders[0].reject(new Error("500"));
    });
    click("Place order");
    expect(orders).toHaveLength(2);
    await act(async () => {
      orders[1].resolve({ data: { orderId: "o-77" } });
    });
    expect(screen.getByRole("status")).toHaveTextContent("Order placed — #o-77");
    expect(useCartStore.getState().total_items).toBe(0);
    expect(orders[1].body.address.name).toBe("Ana Shopper");
    expect(orders[1].body.slot).toBe("Tomorrow 8–10 am");
    expect(orders[1].body.total).toBeCloseTo(4.65);
  });
});
