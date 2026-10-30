// src/__tests__/AddToCartButton.test.jsx — YOUR test file.
// Available: describe, it, expect, beforeEach, fn, sleep, plus Testing Library:
//   render, screen, fireEvent, waitFor, within  from "@testing-library/react"
//   userEvent                                   from "@testing-library/user-event"
// The component under test is src/components/AddToCartButton.jsx (open its tab).
//
// "Run Tests" runs this file against the real component and then against copies
// with one bug planted in each. Make every planted bug fail at least one test.
import { render, screen, fireEvent } from "@testing-library/react";
import AddToCartButton from "../components/AddToCartButton";
import useCartStore from "../store/useCartStore";
import { products } from "../data/products";

const bananas = products[0]; // stock 40
const milk = products[1]; // stock 3
const avocados = products[2]; // stock 0

// Start every test with an empty cart.
beforeEach(() => useCartStore.getState().clear_cart());

describe("AddToCartButton", () => {
  // Weak starter test: it passes, but says nothing about the stepper rules.
  it("renders an Add to cart button", () => {
    render(<AddToCartButton product={bananas} />);
    expect(screen.getByText("Add to cart")).toBeInTheDocument();
  });

  // TODO: the stepper starts at 1 and + / - change it (use the accessible button names)
  // TODO: it never goes below 1
  // TODO: it never goes above the product's stock (milk has only 3)
  // TODO: "Add to cart" puts the SELECTED quantity into the cart (check useCartStore.getState())
  // TODO: after adding, the selector goes back to 1
  // TODO: a sold-out product (avocados) shows a disabled "Out of stock" button
});

void fireEvent;
void milk;
void avocados;
