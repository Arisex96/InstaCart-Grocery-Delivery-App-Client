// Test-only helpers (hidden from learners; never shown in the editor).
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/** Renders inside an in-memory router, like the live preview does. */
export function renderWithRouter(ui, { route = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

/** A promise you resolve/reject by hand: lets tests control response order. */
export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
