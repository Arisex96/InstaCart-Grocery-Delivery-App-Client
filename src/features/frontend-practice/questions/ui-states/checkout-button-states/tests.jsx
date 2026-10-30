import { act, screen, fireEvent, waitFor, render } from "@testing-library/react";
import { renderWithRouter, deferred } from "./testing/utils";
import CheckoutSummary from "./src/components/CheckoutSummary";
import usePlaceOrder from "./src/hooks/usePlaceOrder";
import useCartStore from "./src/store/useCartStore";
import api from "./src/api/axios";
import { products } from "./src/data/products";

const [bananas, milk, avocados] = products; // milk stock 3, avocados stock 0

const seed = (lines) =>
  useCartStore.setState({
    items: lines.map(([product, quantity]) => ({ product, quantity })),
    total_price: lines.reduce((sum, [product, quantity]) => sum + product.price * quantity, 0),
    total_items: lines.reduce((sum, [, quantity]) => sum + quantity, 0),
  });

// POST /orders parks on a promise each test settles by hand.
const realPost = api.post;
let posts;
beforeEach(() => {
  useCartStore.getState().clear_cart();
  posts = [];
  api.post = (url, body) => {
    const request = { ...deferred(), url, body };
    posts.push(request);
    return request.promise;
  };
});
afterEach(() => {
  api.post = realPost;
});

const placeButton = () => screen.getByRole("button", { name: /place order|placing order/i });

describe("CheckoutSummary", () => {
  it("shows the order total on the button for a valid cart", () => {
    seed([[bananas, 2], [milk, 1]]);
    renderWithRouter(<CheckoutSummary />);
    expect(screen.getByRole("button", { name: "Place order · $10.90" })).toBeEnabled();
  });

  it("explains and disables when the cart is empty", () => {
    renderWithRouter(<CheckoutSummary />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(placeButton()).toBeDisabled();
  });

  it("disables checkout and names the out-of-stock item", () => {
    seed([[bananas, 1], [avocados, 1]]);
    renderWithRouter(<CheckoutSummary />);
    expect(screen.getByText("Hass Avocados is out of stock")).toBeInTheDocument();
    expect(placeButton()).toBeDisabled();
  });

  it("disables checkout when a quantity exceeds stock and says by how much", () => {
    seed([[milk, 5]]);
    renderWithRouter(<CheckoutSummary />);
    expect(screen.getByText("Whole Milk: only 3 available (you have 5)")).toBeInTheDocument();
    expect(placeButton()).toBeDisabled();
  });

  it("allows an item whose quantity equals its stock", () => {
    seed([[milk, 3]]);
    renderWithRouter(<CheckoutSummary />);
    expect(placeButton()).toBeEnabled();
    expect(screen.queryByText(/only \d+ available/)).not.toBeInTheDocument();
  });

  it("shows Placing order… and disables the button while the request is pending", async () => {
    seed([[bananas, 2]]);
    renderWithRouter(<CheckoutSummary />);
    fireEvent.click(placeButton());
    await waitFor(() => expect(posts.length).toBe(1));
    expect(screen.getByRole("button", { name: "Placing order…" })).toBeDisabled();
    expect(posts[0].url).toBe("/orders");
    expect(posts[0].body.items).toEqual([{ product: "p1", quantity: 2 }]);
  });

  it("clears the cart and shows the confirmation after success", async () => {
    seed([[bananas, 2]]);
    renderWithRouter(<CheckoutSummary />);
    fireEvent.click(placeButton());
    await waitFor(() => expect(posts.length).toBe(1));
    await act(async () => {
      posts[0].resolve({ data: { orderId: "o-42", status: "placed" } });
    });
    expect(screen.getByText("Order placed")).toBeInTheDocument();
    expect(screen.getByText(/o-42/)).toBeInTheDocument();
    expect(useCartStore.getState().total_items).toBe(0);
  });

  it("shows the server message after a failure and lets the shopper retry", async () => {
    seed([[bananas, 2]]);
    renderWithRouter(<CheckoutSummary />);
    fireEvent.click(placeButton());
    await waitFor(() => expect(posts.length).toBe(1));
    await act(async () => {
      const error = new Error("Request failed");
      error.response = { data: { message: "Only 1 in stock" } };
      posts[0].reject(error);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Only 1 in stock");
    expect(useCartStore.getState().total_items).toBe(2); // cart untouched
    expect(placeButton()).toBeEnabled();

    fireEvent.click(placeButton());
    await waitFor(() => expect(posts.length).toBe(2)); // a retry is really sent
    expect(screen.queryByRole("alert")).not.toBeInTheDocument(); // the old error is cleared
  });
});

describe("usePlaceOrder", () => {
  function Harness() {
    const { placeOrder, status, error } = usePlaceOrder();
    return (
      <div>
        <button
          onClick={() => {
            // Two calls in the same tick, before React can re-render.
            placeOrder({ total: 1 });
            placeOrder({ total: 1 });
          }}
        >
          double
        </button>
        <button onClick={() => placeOrder({ total: 1 })}>single</button>
        <span data-testid="status">{status}</span>
        <span data-testid="error">{error ?? ""}</span>
      </div>
    );
  }

  it("sends exactly one request for a double submit", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("double"));
    await waitFor(() => expect(posts.length).toBeGreaterThanOrEqual(1));
    await sleep(30);
    expect(posts.length).toBe(1);
  });

  it("ends in status error after a failed request, and in success after a good one", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("single"));
    await waitFor(() => expect(posts.length).toBe(1));
    expect(screen.getByTestId("status")).toHaveTextContent("submitting");
    await act(async () => {
      posts[0].reject(new Error("boom"));
    });
    expect(screen.getByTestId("status")).toHaveTextContent("error");
    expect(screen.getByTestId("error")).toHaveTextContent("Something went wrong");

    fireEvent.click(screen.getByText("single"));
    await waitFor(() => expect(posts.length).toBe(2));
    await act(async () => {
      posts[1].resolve({ data: { orderId: "o-1" } });
    });
    expect(screen.getByTestId("status")).toHaveTextContent("success");
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });
});
