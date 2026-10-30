import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./src/components/ui/Accordion";

const Sections = (props) => (
  <Accordion {...props}>
    <AccordionItem value="categories">
      <AccordionTrigger>Categories</AccordionTrigger>
      <AccordionPanel>Fruits and bakery</AccordionPanel>
    </AccordionItem>
    <AccordionItem value="price">
      <AccordionTrigger>Price Range</AccordionTrigger>
      <AccordionPanel>Min and max</AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const trigger = (name) => screen.getByRole("button", { name });

describe("uncontrolled", () => {
  it("opens the defaultValue section and closes the others", () => {
    render(<Sections defaultValue="price" />);
    expect(screen.getByText("Min and max")).toBeInTheDocument();
    expect(screen.queryByText("Fruits and bakery")).not.toBeInTheDocument();
  });

  it("opens a clicked section and closes the previously open one", () => {
    render(<Sections defaultValue="categories" />);
    fireEvent.click(trigger("Price Range"));
    expect(screen.getByText("Min and max")).toBeInTheDocument();
    expect(screen.queryByText("Fruits and bakery")).not.toBeInTheDocument();
  });

  it("collapses a section when its open trigger is clicked again", () => {
    render(<Sections defaultValue="categories" />);
    fireEvent.click(trigger("Categories"));
    expect(screen.queryByText("Fruits and bakery")).not.toBeInTheDocument();
  });

  it("reports changes through onValueChange (null when collapsing)", () => {
    const onValueChange = fn();
    render(<Sections defaultValue="categories" onValueChange={onValueChange} />);
    fireEvent.click(trigger("Price Range"));
    fireEvent.click(trigger("Price Range"));
    expect(onValueChange.mock.calls).toEqual([["price"], [null]]);
  });
});

describe("accessibility", () => {
  it("exposes aria-expanded on triggers and a labelled region for the open panel", () => {
    render(<Sections defaultValue="categories" />);
    expect(trigger("Categories")).toHaveAttribute("aria-expanded", "true");
    expect(trigger("Price Range")).toHaveAttribute("aria-expanded", "false");
    const region = screen.getByRole("region", { name: "Categories" });
    expect(trigger("Categories")).toHaveAttribute("aria-controls", region.id);
  });

  it("does not render closed panels at all", () => {
    render(<Sections />);
    expect(screen.queryByText("Fruits and bakery")).not.toBeInTheDocument();
    expect(screen.queryByText("Min and max")).not.toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("keeps ids unique across accordions on the same page", () => {
    render(
      <>
        <Sections defaultValue="categories" />
        <Sections defaultValue="categories" />
      </>,
    );
    const regions = screen.getAllByRole("region");
    expect(new Set(regions.map((r) => r.id)).size).toBe(2);
  });
});

describe("controlled", () => {
  const Parent = ({ onValueChange }) => {
    const [value, setValue] = useState("categories");
    return (
      <>
        <button onClick={() => setValue("price")}>outside: open price</button>
        <button onClick={() => setValue(null)}>outside: close all</button>
        <Sections
          value={value}
          onValueChange={(next) => {
            onValueChange?.(next);
            setValue(next);
          }}
        />
      </>
    );
  };

  it("follows the value prop when the parent changes it", () => {
    render(<Parent />);
    expect(screen.getByText("Fruits and bakery")).toBeInTheDocument();
    fireEvent.click(screen.getByText("outside: open price"));
    expect(screen.getByText("Min and max")).toBeInTheDocument();
    expect(screen.queryByText("Fruits and bakery")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("outside: close all"));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("treats value={null} as controlled and collapsed", () => {
    render(<Sections value={null} onValueChange={fn()} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    fireEvent.click(trigger("Categories"));
    expect(screen.queryByRole("region")).not.toBeInTheDocument(); // parent did not accept the change
  });

  it("only reports the requested change; it does not change itself", () => {
    const onValueChange = fn();
    render(<Sections value="categories" onValueChange={onValueChange} />);
    fireEvent.click(trigger("Price Range"));
    expect(onValueChange.mock.calls).toEqual([["price"]]);
    expect(screen.getByText("Fruits and bakery")).toBeInTheDocument();
    expect(screen.queryByText("Min and max")).not.toBeInTheDocument();
  });
});
