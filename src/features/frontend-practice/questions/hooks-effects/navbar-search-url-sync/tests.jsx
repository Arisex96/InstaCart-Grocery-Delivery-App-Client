import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./src/components/SearchBar";

function Probe() {
  const location = useLocation();
  return <p data-testid="loc">{location.pathname + location.search}</p>;
}
function History() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate(-1)}>back</button>
      <button onClick={() => navigate(1)}>forward</button>
    </>
  );
}

const setup = (entries = ["/products"], { index = entries.length - 1, debounceMs = 120 } = {}) =>
  render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <SearchBar debounceMs={debounceMs} />
      <Probe />
      <History />
    </MemoryRouter>,
  );

const box = () => screen.getByLabelText("Search products");
const loc = () => screen.getByTestId("loc").textContent;
const searchParam = () => new URLSearchParams(loc().split("?")[1] ?? "");

describe("SearchBar <-> URL", () => {
  it("starts with the box showing the URL's search", () => {
    setup(["/products?search=milk"]);
    expect(box()).toHaveValue("milk");
  });

  it("writes typed text to ?search= after the typing pause", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(box(), "milk");
    expect(loc()).toBe("/products");
    await sleep(450);
    expect(loc()).toBe("/products?search=milk");
  });

  it("keeps other query params when searching", async () => {
    const user = userEvent.setup();
    setup(["/products?category=bakery"]);
    await user.type(box(), "bread");
    await sleep(450);
    expect(searchParam().get("category")).toBe("bakery");
    expect(searchParam().get("search")).toBe("bread");
  });

  it("removes the search param when the box is cleared", async () => {
    const user = userEvent.setup();
    setup(["/products?search=milk"]);
    await user.clear(box());
    await sleep(450);
    expect(loc()).toBe("/products");
  });

  it("Back shows the previous search in the box and the URL stays there", async () => {
    const user = userEvent.setup();
    setup(["/products?search=milk", "/products?search=eggs"]);
    expect(box()).toHaveValue("eggs");
    await user.click(screen.getByText("back"));
    await sleep(500);
    expect(loc()).toBe("/products?search=milk");
    expect(box()).toHaveValue("milk");
  });

  it("Back twice walks through the history instead of being pulled forward", async () => {
    const user = userEvent.setup();
    setup(["/products?search=milk", "/products?search=eggs", "/products?search=bread"]);
    await user.click(screen.getByText("back"));
    await sleep(450);
    await user.click(screen.getByText("back"));
    await sleep(450);
    expect(loc()).toBe("/products?search=milk");
    expect(box()).toHaveValue("milk");
  });

  it("Forward after Back returns to the later search", async () => {
    const user = userEvent.setup();
    setup(["/products?search=milk", "/products?search=eggs"]);
    await user.click(screen.getByText("back"));
    await sleep(450);
    await user.click(screen.getByText("forward"));
    await sleep(450);
    expect(loc()).toBe("/products?search=eggs");
    expect(box()).toHaveValue("eggs");
  });

  it("Enter searches immediately, without waiting for the debounce", async () => {
    const user = userEvent.setup();
    setup(["/products"], { debounceMs: 600 });
    await user.type(box(), "eggs{Enter}");
    expect(loc()).toBe("/products?search=eggs");
  });

  it("keeps special characters intact when searching with Enter", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(box(), "fish & chips{Enter}");
    await sleep(450);
    expect(searchParam().get("search")).toBe("fish & chips");
  });
});
