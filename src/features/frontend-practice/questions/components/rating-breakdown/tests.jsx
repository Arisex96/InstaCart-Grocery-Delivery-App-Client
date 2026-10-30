import { render, screen, within } from "@testing-library/react";
import RatingBreakdown from "./src/components/RatingBreakdown";

// Tests check the contract in the UI requirements: text, roles and aria values.
const reviews = (ratings) => ratings.map((rating, i) => ({ _id: "r" + i, rating, comment: "c" }));
const bar = (name) => screen.getByRole("progressbar", { name });
const rows = () => within(screen.getByRole("list", { name: "Rating distribution" })).getAllByRole("listitem");

describe("summary", () => {
  it("shows the average with one decimal in its own element", () => {
    render(<RatingBreakdown reviews={reviews([5, 5, 5, 4, 4, 3, 1])} />);
    expect(screen.getByText("3.9")).toBeInTheDocument(); // 27 / 7 = 3.857
  });

  it("keeps the decimal for whole averages (4.0, not 4)", () => {
    render(<RatingBreakdown reviews={reviews([4, 4, 4])} />);
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });

  it("says how many reviews the summary is based on, singular and plural", () => {
    const { rerender } = render(<RatingBreakdown reviews={reviews([5, 4])} />);
    expect(screen.getByText("Based on 2 reviews")).toBeInTheDocument();
    rerender(<RatingBreakdown reviews={reviews([5])} />);
    expect(screen.getByText("Based on 1 review")).toBeInTheDocument();
  });
});

describe("distribution", () => {
  it("renders five rows in the order 5 to 1 with label and count", () => {
    render(<RatingBreakdown reviews={reviews([5, 5, 5, 4, 4, 3, 1])} />);
    const list = rows();
    expect(list).toHaveLength(5);
    expect(list.map((li) => li.textContent.match(/\d stars?/)[0])).toEqual(["5 stars", "4 stars", "3 stars", "2 stars", "1 star"]);
    expect(within(list[0]).getByText("3")).toBeInTheDocument();
    expect(within(list[1]).getByText("2")).toBeInTheDocument();
    expect(within(list[3]).getByText("0")).toBeInTheDocument();
  });

  it("gives each progressbar the share of reviews as aria-valuenow (rounded)", () => {
    render(<RatingBreakdown reviews={reviews([5, 5, 5, 4, 4, 3, 1])} />);
    expect(bar("5 stars")).toHaveAttribute("aria-valuenow", "43"); // 3 / 7
    expect(bar("4 stars")).toHaveAttribute("aria-valuenow", "29"); // 2 / 7
    expect(bar("2 stars")).toHaveAttribute("aria-valuenow", "0");
    expect(bar("1 star")).toHaveAttribute("aria-valuenow", "14");
  });

  it("declares the progressbar range 0 to 100", () => {
    render(<RatingBreakdown reviews={reviews([5])} />);
    expect(bar("5 stars")).toHaveAttribute("aria-valuemin", "0");
    expect(bar("5 stars")).toHaveAttribute("aria-valuemax", "100");
    expect(bar("5 stars")).toHaveAttribute("aria-valuenow", "100");
  });

  it("ignores ratings outside 1 to 5", () => {
    render(<RatingBreakdown reviews={reviews([5, 0, 6])} />);
    expect(screen.getByText("Based on 1 review")).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });
});

describe("empty state", () => {
  it("shows No reviews yet and no average, rows or progressbars", () => {
    render(<RatingBreakdown reviews={[]} />);
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
    expect(screen.queryByRole("list", { name: "Rating distribution" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Based on/)).not.toBeInTheDocument();
  });

  it("updates when reviews are added", () => {
    const { rerender } = render(<RatingBreakdown reviews={[]} />);
    rerender(<RatingBreakdown reviews={reviews([2, 2])} />);
    expect(screen.queryByText("No reviews yet")).not.toBeInTheDocument();
    expect(screen.getByText("2.0")).toBeInTheDocument();
  });
});
