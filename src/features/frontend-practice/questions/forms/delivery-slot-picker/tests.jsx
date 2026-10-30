import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeliverySlotPicker from "./src/components/DeliverySlotPicker";

// Tests check the contract in the UI requirements: roles, accessible names, checked/disabled state.
const slot = (id, label, full = false) => ({ id, label, full });
const days = [
  { id: "today", label: "Today", slots: [slot("a", "10 AM–12 PM"), slot("b", "2–4 PM", true)] },
  { id: "tomorrow", label: "Tomorrow", slots: [slot("a", "8–10 AM"), slot("b", "2–4 PM")] },
];

const tab = (name) => screen.getByRole("tab", { name });
const radios = () => screen.getAllByRole("radio");
const radio = (name) => screen.getByRole("radio", { name });

/** A parent that owns the value, like the checkout form does. */
function Harness({ initial = null, onChange = () => {} }) {
  const [value, setValue] = useState(initial);
  return (
    <DeliverySlotPicker
      days={days}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe("day tabs", () => {
  it("renders a tab per day and views the first day by default", () => {
    render(<DeliverySlotPicker days={days} value={null} onChange={fn()} />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Today", "Tomorrow"]);
    expect(tab("Today")).toHaveAttribute("aria-selected", "true");
    expect(tab("Tomorrow")).toHaveAttribute("aria-selected", "false");
  });

  it("starts on the day of the current value", () => {
    render(<DeliverySlotPicker days={days} value={{ dayId: "tomorrow", slotId: "a" }} onChange={fn()} />);
    expect(tab("Tomorrow")).toHaveAttribute("aria-selected", "true");
  });

  it("switches the visible slots when another tab is clicked", async () => {
    render(<Harness />);
    expect(radio("10 AM–12 PM")).toBeInTheDocument();
    await userEvent.click(tab("Tomorrow"));
    expect(tab("Tomorrow")).toHaveAttribute("aria-selected", "true");
    expect(radio("8–10 AM")).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "10 AM–12 PM" })).not.toBeInTheDocument();
  });
});

describe("slots as radios", () => {
  it("renders the slots of the viewed day as real radio inputs in a group named Delivery time", () => {
    render(<DeliverySlotPicker days={days} value={null} onChange={fn()} />);
    expect(screen.getByRole("radiogroup", { name: "Delivery time" })).toBeInTheDocument();
    expect(radios()).toHaveLength(2);
    radios().forEach((r) => expect(r.tagName).toBe("INPUT"));
  });

  it("disables full slots and labels them Full", () => {
    render(<DeliverySlotPicker days={days} value={null} onChange={fn()} />);
    expect(radio("2–4 PM Full")).toBeDisabled();
    expect(radio("10 AM–12 PM")).toBeEnabled();
  });

  it("calls onChange({ dayId, slotId }) when a slot is chosen, and never for a full slot", async () => {
    const onChange = fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(radio("2–4 PM Full"));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(radio("10 AM–12 PM"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ dayId: "today", slotId: "a" });
  });

  it("checks only the radio that matches the value, and only on its own day", async () => {
    render(<DeliverySlotPicker days={days} value={{ dayId: "today", slotId: "a" }} onChange={fn()} />);
    expect(radio("10 AM–12 PM")).toBeChecked();
    await userEvent.click(tab("Tomorrow"));
    radios().forEach((r) => expect(r).not.toBeChecked()); // "a" exists tomorrow too, but is not selected
  });
});

describe("status line", () => {
  it("asks to pick a slot when there is no value", () => {
    render(<DeliverySlotPicker days={days} value={null} onChange={fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Pick a delivery slot");
  });

  it("summarises the selection and keeps it while another day is viewed", async () => {
    render(<Harness />);
    await userEvent.click(tab("Tomorrow"));
    await userEvent.click(radio("2–4 PM"));
    expect(screen.getByRole("status")).toHaveTextContent("Selected: Tomorrow, 2–4 PM");
    await userEvent.click(tab("Today"));
    expect(screen.getByRole("status")).toHaveTextContent("Selected: Tomorrow, 2–4 PM");
  });
});
