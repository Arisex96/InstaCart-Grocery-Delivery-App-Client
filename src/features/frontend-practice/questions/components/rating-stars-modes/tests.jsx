import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RatingStars from "./src/components/RatingStars";

const fills = (container) => [...container.querySelectorAll("[data-fill]")].map((el) => el.getAttribute("data-fill"));

describe("fill rules", () => {
  it("shows 4.5 as four full stars and a half star", () => {
    const { container } = render(<RatingStars rating={4.5} readOnly />);
    expect(fills(container)).toEqual(["full", "full", "full", "full", "half"]);
  });

  it("rounds 3.7 to the nearest half star (3.5)", () => {
    const { container } = render(<RatingStars rating={3.7} readOnly />);
    expect(fills(container)).toEqual(["full", "full", "full", "half", "empty"]);
  });

  it("keeps whole ratings whole and rounds 4.2 down to 4", () => {
    const a = render(<RatingStars rating={4} readOnly />);
    expect(fills(a.container)).toEqual(["full", "full", "full", "full", "empty"]);
    a.unmount();
    const b = render(<RatingStars rating={4.2} readOnly />);
    expect(fills(b.container)).toEqual(["full", "full", "full", "full", "empty"]);
  });

  it("never renders more than five stars for an out-of-range rating", () => {
    const { container } = render(<RatingStars rating={7} readOnly />);
    expect(fills(container)).toEqual(["full", "full", "full", "full", "full"]);
  });

  it("treats negative and non-numeric ratings as zero instead of crashing", () => {
    for (const bad of [-1, NaN, undefined]) {
      const { container, unmount } = render(<RatingStars rating={bad} readOnly />);
      expect(fills(container)).toEqual(["empty", "empty", "empty", "empty", "empty"]);
      unmount();
    }
  });
});

describe("read-only mode", () => {
  it("is a single image with a text alternative", () => {
    render(<RatingStars rating={4.5} readOnly />);
    expect(screen.getByRole("img", { name: "4.5 out of 5 stars" })).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("never calls onChange, even when a handler is passed", () => {
    const onChange = fn();
    const { container } = render(<RatingStars rating={3} readOnly onChange={onChange} />);
    for (const star of container.querySelectorAll("[data-fill]")) fireEvent.click(star);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("interactive mode", () => {
  it("renders five buttons with accessible names and a pressed state", () => {
    render(<RatingStars rating={3} onChange={fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Rate 1 star",
      "Rate 2 stars",
      "Rate 3 stars",
      "Rate 4 stars",
      "Rate 5 stars",
    ]);
    expect(buttons.map((b) => b.getAttribute("aria-pressed"))).toEqual(["true", "true", "true", "false", "false"]);
  });

  it("calls onChange with the star number on click", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<RatingStars rating={0} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Rate 4 stars" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("is reachable with the keyboard: Tab to a star, Enter to choose it", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<RatingStars rating={0} onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Rate 1 star" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
