import { act, render, screen } from "@testing-library/react";
import { deferred } from "./testing/utils";
import ProductDetails from "./src/components/ProductDetails";
import api from "./src/api/axios";
import reviewsApi from "./src/api/reviewsApi";
import { serverProducts } from "./src/data/products";

// Both endpoints park on promises the test resolves by hand, so the test controls the order.
const realGet = api.get;
const realList = reviewsApi.list;
let products; // productId -> deferred
let reviews; // productId -> deferred

beforeEach(() => {
  products = {};
  reviews = {};
  api.get = (url) => {
    const id = url.split("/").pop();
    products[id] = deferred();
    return products[id].promise;
  };
  reviewsApi.list = (id) => {
    reviews[id] = deferred();
    return reviews[id].promise;
  };
});
afterEach(() => {
  api.get = realGet;
  reviewsApi.list = realList;
});

const REVIEW = (id, comment) => [{ id, author: "Maya", rating: 5, comment }];
const productFor = (id) => ({ data: { product: serverProducts.find((p) => p.id === id) } });
const settle = (action) => act(async () => action());

describe("ProductDetails", () => {
  it("shows the product and its reviews", async () => {
    render(<ProductDetails productId="p1" />);
    await settle(() => products.p1.resolve(productFor("p1")));
    await settle(() => reviews.p1.resolve(REVIEW("r1", "Perfectly ripe")));
    expect(screen.getByRole("heading", { name: "Organic Bananas" })).toBeInTheDocument();
    expect(screen.getByText("Perfectly ripe")).toBeInTheDocument();
  });

  it("requests the product and its reviews at the same time", () => {
    render(<ProductDetails productId="p1" />);
    // Neither request has resolved yet, and both must already have been made.
    expect(products.p1).toBeDefined();
    expect(reviews.p1).toBeDefined();
  });

  it("still shows the product when only the reviews fail", async () => {
    render(<ProductDetails productId="p3" />);
    await settle(() => products.p3.resolve(productFor("p3")));
    await settle(() => reviews.p3?.reject(new Error("Reviews service unavailable")));
    expect(screen.getByRole("heading", { name: "Hass Avocados" })).toBeInTheDocument();
    expect(screen.getByText("Reviews are unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Could not load product")).not.toBeInTheDocument();
  });

  it("shows the page error when the product itself fails", async () => {
    render(<ProductDetails productId="p1" />);
    await settle(() => reviews.p1?.resolve(REVIEW("r1", "Perfectly ripe")));
    await settle(() => products.p1.reject(new Error("500")));
    expect(screen.getByText("Could not load product")).toBeInTheDocument();
  });

  it("shows \"No reviews yet\" for a product without reviews", async () => {
    render(<ProductDetails productId="p4" />);
    await settle(() => products.p4.resolve(productFor("p4")));
    await settle(() => reviews.p4?.resolve([]));
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  it("never shows the previous product's reviews under the new product", async () => {
    const view = render(<ProductDetails productId="p1" />);
    const oldProduct = products.p1;
    const oldReviews = reviews.p1;
    view.rerender(<ProductDetails productId="p2" />);
    await settle(() => products.p2.resolve(productFor("p2")));
    await settle(() => reviews.p2?.resolve(REVIEW("r3", "Fresh milk")));
    await settle(() => oldProduct?.resolve(productFor("p1")));
    await settle(() => oldReviews?.resolve(REVIEW("r1", "Perfectly ripe bananas")));
    expect(screen.getByRole("heading", { name: "Whole Milk" })).toBeInTheDocument();
    expect(screen.getByText("Fresh milk")).toBeInTheDocument();
    expect(screen.queryByText("Perfectly ripe bananas")).not.toBeInTheDocument();
  });

  it("ignores an old product that finishes after the new one", async () => {
    const view = render(<ProductDetails productId="p1" />);
    const oldProduct = products.p1;
    view.rerender(<ProductDetails productId="p2" />);
    await settle(() => products.p2.resolve(productFor("p2")));
    await settle(() => reviews.p2?.resolve([]));
    await settle(() => oldProduct.resolve(productFor("p1")));
    expect(screen.getByRole("heading", { name: "Whole Milk" })).toBeInTheDocument();
    expect(screen.queryByText("Organic Bananas")).not.toBeInTheDocument();
  });
});
