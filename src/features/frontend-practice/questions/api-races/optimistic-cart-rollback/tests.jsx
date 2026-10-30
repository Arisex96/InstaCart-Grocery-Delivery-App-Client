import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import AddToCartControl from "./src/components/AddToCartControl";
import api from "./src/api/axios";
import { products } from "./src/data/products";

const milk = products[1]; // stock 3

// api.post parks every request on a promise the test settles by hand, so the ORDER of
// the responses is decided by the test. No timing involved.
const realPost = api.post;
let requests;

beforeEach(() => {
  requests = [];
  api.__reset();
  api.post = (url, body) => {
    const request = deferred();
    requests.push({ body, ...request });
    return request.promise;
  };
});
afterEach(() => {
  api.post = realPost;
});

const stockError = (message = "Only 3 in stock") =>
  Object.assign(new Error("Request failed with status code 409"), { response: { status: 409, data: { message } } });
const ok = (index) =>
  act(async () => {
    requests[index].resolve({ data: { productId: milk._id, quantity: requests[index].body.quantity } });
  });
const reject = (index, error = stockError()) =>
  act(async () => {
    requests[index].reject(error);
  });

const button = () => screen.getByRole("button", { name: "Add Whole Milk to cart" });
const shown = (n) => screen.getByText("In cart: " + n);
const setup = () => {
  const user = userEvent.setup();
  render(<AddToCartControl product={milk} />);
  return user;
};

describe("AddToCartControl", () => {
  it("increments the quantity immediately and sends the absolute quantity", async () => {
    const user = setup();
    await user.click(button());
    expect(shown(1)).toBeInTheDocument();
    expect(requests[0].body).toEqual({ productId: "p2", quantity: 1 });
    await user.click(button());
    expect(shown(2)).toBeInTheDocument();
    expect(requests[1].body.quantity).toBe(2);
  });

  it("rolls back and shows the server message when the only request fails", async () => {
    const user = setup();
    await user.click(button());
    await reject(0);
    expect(shown(0)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Only 3 in stock");
  });

  it("keeps the button busy until every request has settled", async () => {
    const user = setup();
    await user.click(button());
    await user.click(button());
    await ok(0);
    expect(button()).toHaveAttribute("aria-busy", "true");
    await ok(1);
    expect(button()).toHaveAttribute("aria-busy", "false");
  });

  it("ignores an older response that arrives after a newer one", async () => {
    const user = setup();
    await user.click(button());
    await user.click(button());
    await ok(1); // the newer request (quantity 2) answers first
    await ok(0); // the older one (quantity 1) arrives late
    expect(shown(2)).toBeInTheDocument();
  });

  it("does not let a failed older request undo a newer successful one", async () => {
    const user = setup();
    await user.click(button());
    await user.click(button());
    await ok(1);
    await reject(0);
    expect(shown(2)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("rolls back to the last confirmed quantity when the latest request fails", async () => {
    const user = setup();
    await user.click(button());
    await user.click(button());
    await ok(0);
    await reject(1);
    expect(shown(1)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Only 3 in stock");
  });

  it("clears the previous error as soon as the shopper clicks again", async () => {
    const user = setup();
    await user.click(button());
    await reject(0);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.click(button());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(shown(1)).toBeInTheDocument();
  });

  it("works against the fake api: the 4th unit of a 3-unit product is rejected", async () => {
    api.post = realPost;
    api.__configure({ latency: 10 });
    const user = userEvent.setup();
    render(<AddToCartControl product={milk} />);
    for (let i = 0; i < 4; i++) await user.click(button());
    expect(await screen.findByRole("alert")).toHaveTextContent("Only 3 in stock");
    await waitFor(() => expect(button()).toHaveAttribute("aria-busy", "false"));
    expect(shown(3)).toBeInTheDocument();
  });
});
