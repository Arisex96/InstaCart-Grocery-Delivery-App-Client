import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewsList from "./src/components/ReviewsList";
import { relativeDate, sortReviews, countByRating } from "./src/lib/reviewUtils";
import { reviews } from "./src/data/reviews";

// Tests check the contract in the UI requirements (roles, labels, text), not class names.
const NOW = new Date("2026-03-10T12:00:00Z");
const show = (list = reviews, props = {}) => render(<ReviewsList reviews={list} now={NOW} {...props} />);
const names = () => screen.queryAllByRole("listitem").map((li) => li.querySelector("span, p")?.textContent);
const items = () => screen.queryAllByRole("listitem");
const status = () => screen.getByRole("status");
const chip = (label) => screen.getByRole("button", { name: label });
const sortBy = (label) => userEvent.selectOptions(screen.getByLabelText("Sort by"), label);
const deepFreeze = (list) => list.map((r) => Object.freeze({ ...r }));

describe("helpers", () => {
  it("relative date copy follows the day / week / month / year rules (UTC calendar days)", () => {
    const ago = (days) => new Date(NOW.getTime() - days * 86400000).toISOString();
    expect(relativeDate("2026-03-10T00:30:00Z", NOW)).toBe("Today");
    expect(relativeDate("2026-03-09T23:59:00Z", NOW)).toBe("Yesterday"); // different calendar day
    expect(relativeDate(ago(5), NOW)).toBe("5 days ago");
    expect(relativeDate(ago(6), NOW)).toBe("6 days ago");
    expect(relativeDate(ago(7), NOW)).toBe("1 week ago");
    expect(relativeDate(ago(18), NOW)).toBe("2 weeks ago");
    expect(relativeDate(ago(29), NOW)).toBe("4 weeks ago");
    expect(relativeDate(ago(30), NOW)).toBe("1 month ago");
    expect(relativeDate(ago(110), NOW)).toBe("3 months ago");
    expect(relativeDate(ago(365), NOW)).toBe("1 year ago");
    expect(relativeDate(ago(800), NOW)).toBe("2 years ago");
    expect(relativeDate("2026-03-12T00:00:00Z", NOW)).toBe("Today"); // future
  });

  it("sorts newest, highest and lowest with newer-first tie-breaks, on a copy", () => {
    const input = deepFreeze(reviews);
    Object.freeze(input);
    const ids = (mode) => sortReviews(input, mode).map((r) => r._id);
    expect(ids("newest")).toEqual(["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"]);
    expect(ids("highest")).toEqual(["r1", "r3", "r5", "r2", "r7", "r6", "r4", "r8"]);
    expect(ids("lowest")).toEqual(["r8", "r4", "r6", "r2", "r7", "r1", "r3", "r5"]);
    expect(sortReviews(input, "newest")).not.toBe(input);
    expect(input.map((r) => r._id)[0]).toBe("r5"); // input order untouched
  });

  it("counts reviews per star rating", () => {
    expect(countByRating(reviews)).toEqual({ 5: 3, 4: 2, 3: 1, 2: 1, 1: 1 });
    expect(countByRating([])).toEqual({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  });
});

describe("initial list", () => {
  it("shows the heading, the count, the newest 3 reviews and the Showing line", () => {
    show();
    expect(screen.getByRole("heading", { name: "Customer reviews", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("8 reviews")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort by")).toHaveValue("newest");
    expect(screen.getByRole("list", { name: "Reviews" })).toBeInTheDocument();
    expect(names()).toEqual(["Priya", "Marcus", "Lena"]);
    expect(status()).toHaveTextContent("Showing 3 of 8");
    expect(screen.getByRole("button", { name: "Show more" })).toBeInTheDocument();
    expect(items()[0]).toHaveTextContent("Rated 5 out of 5");
    expect(items()[0]).toHaveTextContent("Today");
    expect(items()[2]).toHaveTextContent("5 days ago");
  });

  it("uses the singular for one review and a friendly empty state for none", () => {
    const { unmount } = show(reviews.slice(0, 1));
    expect(screen.getByText("1 review")).toBeInTheDocument();
    unmount();
    show([]);
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    expect(items()).toHaveLength(0);
  });
});

describe("show more", () => {
  it("reveals 3 more per click and disappears when everything is shown", async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(items()).toHaveLength(6);
    expect(status()).toHaveTextContent("Showing 6 of 8");
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(items()).toHaveLength(8);
    expect(status()).toHaveTextContent("Showing 8 of 8");
    expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    // every relative date label, newest first
    expect(items().map((li) => li.textContent.match(/Today|Yesterday|\d+ days? ago|\d+ weeks? ago|\d+ months? ago|\d+ years? ago/)[0])).toEqual([
      "Today", "Yesterday", "5 days ago", "1 week ago", "2 weeks ago", "1 month ago", "3 months ago", "1 year ago",
    ]);
  });

  it("starts again at 3 when the sort or the filter changes", async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(items()).toHaveLength(6);
    await sortBy("Highest rated");
    expect(items()).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Show more" }));
    await user.click(chip("All (8)"));
    expect(items()).toHaveLength(3);
  });
});

describe("sorting and filtering in the UI", () => {
  it("sorts by highest and lowest rating with newer-first tie-breaks", async () => {
    show();
    await sortBy("Highest rated");
    expect(names()).toEqual(["Priya", "Lena", "Aisha"]);
    await sortBy("Lowest rated");
    expect(names()).toEqual(["Omar", "Tom", "Ben"]);
  });

  it("renders a star chip with the right counts and pressed state, and filters the list", async () => {
    const user = userEvent.setup();
    show();
    expect(chip("All (8)")).toHaveAttribute("aria-pressed", "true");
    expect(chip("5 stars (3)")).toHaveAttribute("aria-pressed", "false");
    expect(chip("1 star (1)")).toBeInTheDocument();
    await user.click(chip("4 stars (2)"));
    expect(chip("4 stars (2)")).toHaveAttribute("aria-pressed", "true");
    expect(chip("All (8)")).toHaveAttribute("aria-pressed", "false");
    expect(names()).toEqual(["Marcus", "Chloe"]);
    expect(status()).toHaveTextContent("Showing 2 of 2");
    expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
  });

  it("shows an empty state for a rating nobody gave and lets you go back to all", async () => {
    const user = userEvent.setup();
    show(reviews.filter((r) => r.rating >= 3)); // no 1 or 2 star reviews
    await user.click(chip("2 stars (0)"));
    expect(screen.getByText("No reviews with this rating")).toBeInTheDocument();
    expect(items()).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Show all reviews" }));
    expect(chip("All (6)")).toHaveAttribute("aria-pressed", "true");
    expect(items().length).toBeGreaterThan(0);
  });
});

describe("helpful votes", () => {
  it("adds one vote per review, toggles it off again and keeps it across sorting", async () => {
    const user = userEvent.setup();
    show();
    const priya = () => items().find((li) => li.textContent.includes("Priya"));
    const button = () => within(priya()).getByRole("button", { name: /Helpful/ });
    expect(button()).toHaveTextContent("Helpful (4)");
    expect(button()).toHaveAttribute("aria-pressed", "false");
    await user.click(button());
    expect(button()).toHaveTextContent("Helpful (5)");
    expect(button()).toHaveAttribute("aria-pressed", "true");

    await sortBy("Highest rated"); // Priya is still on the first page
    expect(button()).toHaveTextContent("Helpful (5)");

    await user.click(button());
    expect(button()).toHaveTextContent("Helpful (4)");
    expect(button()).toHaveAttribute("aria-pressed", "false");
  });

  it("treats a missing helpful count as 0", async () => {
    const user = userEvent.setup();
    show([{ _id: "x1", name: "Solo", rating: 5, date: "2026-03-10T00:00:00Z", comment: "Great" }]);
    const button = screen.getByRole("button", { name: /Helpful/ });
    expect(button).toHaveTextContent("Helpful (0)");
    await user.click(button);
    expect(button).toHaveTextContent("Helpful (1)");
  });
});

describe("immutability", () => {
  it("never mutates a frozen reviews array while sorting, filtering and voting", async () => {
    const user = userEvent.setup();
    const frozen = Object.freeze(deepFreeze(reviews));
    show(frozen);
    await sortBy("Lowest rated");
    await user.click(chip("5 stars (3)"));
    await user.click(screen.getAllByRole("button", { name: /Helpful/ })[0]);
    expect(frozen.map((r) => r._id)).toEqual(reviews.map((r) => r._id));
    expect(frozen[0].helpful).toBe(3);
    expect(screen.getByText("Customer reviews")).toBeInTheDocument();
  });
});
