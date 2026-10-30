import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddressBook from "./src/components/AddressBook";

// Tests check the contract in the UI requirements (roles, labels, text), not class names.
const home = { _id: "a1", label: "Home", address: "12 Maple Street", city: "Austin", state: "TX", zip: "78701", isDefault: true };
const work = { _id: "a2", label: "Work", address: "500 Market Street", city: "San Francisco", state: "CA", zip: "94105", isDefault: false };
const mom = { _id: "a3", label: "Mom", address: "9 Lake Road", city: "Madison", state: "WI", zip: "53703", isDefault: false };

const cards = () => screen.queryAllByRole("listitem");
const card = (label) => cards().find((li) => li.textContent.includes(label));
const lastChange = (onChange) => onChange.mock.calls[onChange.mock.calls.length - 1][0];
const labels = (list) => list.map((a) => a.label);

async function fill(user, values) {
  for (const [label, value] of Object.entries(values)) {
    const input = screen.getByLabelText(label);
    await user.clear(input);
    if (value) await user.type(input, value);
  }
}
const VALID = { Label: "Gym", "Street address": "1 Fit Way", City: "Denver", State: "co", "ZIP code": "80202" };

describe("address list", () => {
  it("lists each address with label, street, 'City, ST 12345' and a single Default badge", () => {
    render(<AddressBook initialAddresses={[home, work]} />);
    expect(screen.getByRole("heading", { name: "Saved addresses", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Addresses" })).toBeInTheDocument();
    expect(cards()).toHaveLength(2);
    expect(card("Home")).toHaveTextContent("12 Maple Street");
    expect(card("Home")).toHaveTextContent("Austin, TX 78701");
    expect(card("Work")).toHaveTextContent("San Francisco, CA 94105");
    expect(screen.getAllByText("Default")).toHaveLength(1);
    expect(within(card("Home")).getByText("Default")).toBeInTheDocument();
  });

  it("offers Edit and Delete on every card and Set as default only on non-default cards", () => {
    render(<AddressBook initialAddresses={[home, work]} />);
    expect(screen.getByRole("button", { name: "Edit Home" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Work" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set Work as default" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Set Home as default" })).not.toBeInTheDocument();
  });

  it("shows the empty state text instead of the list for an empty book", () => {
    render(<AddressBook initialAddresses={[]} />);
    expect(screen.getByText("No saved addresses")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("form and validation", () => {
  it("opens an empty labelled form with Add address and closes it with Cancel, changing nothing", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[home]} onChange={onChange} />);
    expect(screen.queryByRole("form", { name: "Address form" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add address" }));
    expect(screen.getByRole("form", { name: "Address form" })).toBeInTheDocument();
    for (const label of ["Label", "Street address", "City", "State", "ZIP code"]) {
      expect(screen.getByLabelText(label)).toHaveValue("");
    }
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("form", { name: "Address form" })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(cards()).toHaveLength(1);
  });

  it("validation shows role=alert messages with aria-invalid and saves nothing", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[home]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Add address" }));
    await user.click(screen.getByRole("button", { name: "Save address" }));
    const messages = screen.getAllByRole("alert").map((a) => a.textContent);
    expect(messages).toEqual([
      "Label is required",
      "Street address is required",
      "City is required",
      "State must be 2 letters",
      "ZIP code must be 5 digits",
    ]);
    expect(screen.getByLabelText("City")).toHaveAttribute("aria-invalid", "true");
    expect(onChange).not.toHaveBeenCalled();
    expect(cards()).toHaveLength(1);
  });

  it("rejects a 3-letter state and a 4-digit or lettered zip", async () => {
    const user = userEvent.setup();
    render(<AddressBook initialAddresses={[]} />);
    await user.click(screen.getByRole("button", { name: "Add address" }));
    await fill(user, { ...VALID, State: "TEX", "ZIP code": "1234" });
    await user.click(screen.getByRole("button", { name: "Save address" }));
    expect(screen.getByText("State must be 2 letters")).toBeInTheDocument();
    expect(screen.getByText("ZIP code must be 5 digits")).toBeInTheDocument();
    await fill(user, { State: "TX", "ZIP code": "12a45" });
    await user.click(screen.getByRole("button", { name: "Save address" }));
    expect(screen.getByText("ZIP code must be 5 digits")).toBeInTheDocument();
    expect(screen.queryByText("State must be 2 letters")).not.toBeInTheDocument();
  });
});

describe("add and edit", () => {
  it("adds a valid address, upper-cases the state, closes the form and reports the new array", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[home, work]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Add address" }));
    await fill(user, VALID);
    await user.click(screen.getByRole("button", { name: "Save address" }));
    expect(cards()).toHaveLength(3);
    expect(card("Gym")).toHaveTextContent("Denver, CO 80202");
    expect(screen.queryByRole("form", { name: "Address form" })).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(labels(lastChange(onChange))).toEqual(["Home", "Work", "Gym"]);
    expect(screen.getAllByText("Default")).toHaveLength(1); // the new one is not the default
  });

  it("makes the first address saved into an empty book the default", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Add address" }));
    await fill(user, VALID);
    await user.click(screen.getByRole("button", { name: "Save address" }));
    expect(within(card("Gym")).getByText("Default")).toBeInTheDocument();
    expect(lastChange(onChange)[0].isDefault).toBe(true);
  });

  it("edits in place with a prefilled form and keeps the default flag", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[home, work]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Edit Home" }));
    expect(screen.getByLabelText("Label")).toHaveValue("Home");
    expect(screen.getByLabelText("ZIP code")).toHaveValue("78701");
    await fill(user, { City: "Round Rock", "ZIP code": "78664" });
    await user.click(screen.getByRole("button", { name: "Save address" }));
    expect(cards()).toHaveLength(2);
    expect(card("Home")).toHaveTextContent("Round Rock, TX 78664");
    expect(within(card("Home")).getByText("Default")).toBeInTheDocument();
    expect(lastChange(onChange)).toHaveLength(2);
    expect(lastChange(onChange)[0]).toEqual({ ...home, city: "Round Rock", zip: "78664" });
  });
});

describe("delete and default", () => {
  it("asks for confirmation: No keeps the address, Yes removes it", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[home, work]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Delete Work" }));
    expect(within(card("Work")).getByText("Delete this address?")).toBeInTheDocument();
    await user.click(within(card("Work")).getByRole("button", { name: "No" }));
    expect(cards()).toHaveLength(2);
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete Work" }));
    await user.click(within(card("Work")).getByRole("button", { name: "Yes" }));
    expect(cards()).toHaveLength(1);
    expect(labels(lastChange(onChange))).toEqual(["Home"]);
  });

  it("promotes the first remaining address when the default is deleted, keeping exactly one default", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[home, work, mom]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Delete Home" }));
    await user.click(within(card("Home")).getByRole("button", { name: "Yes" }));
    expect(screen.getAllByText("Default")).toHaveLength(1);
    expect(within(card("Work")).getByText("Default")).toBeInTheDocument();
    expect(lastChange(onChange).filter((a) => a.isDefault).map((a) => a.label)).toEqual(["Work"]);
  });

  it("shows the empty state after deleting the only address", async () => {
    const user = userEvent.setup();
    render(<AddressBook initialAddresses={[home]} />);
    await user.click(screen.getByRole("button", { name: "Delete Home" }));
    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(screen.getByText("No saved addresses")).toBeInTheDocument();
  });

  it("moves the Default badge with Set as default and reports it", async () => {
    const user = userEvent.setup();
    const onChange = fn();
    render(<AddressBook initialAddresses={[home, work]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Set Work as default" }));
    expect(screen.getAllByText("Default")).toHaveLength(1);
    expect(within(card("Work")).getByText("Default")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Set Work as default" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set Home as default" })).toBeInTheDocument();
    expect(lastChange(onChange).map((a) => a.isDefault)).toEqual([false, true]);
  });
});
