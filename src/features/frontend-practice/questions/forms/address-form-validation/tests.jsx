import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import AddressForm from "./src/components/AddressForm";

const VALID = { Label: "Home", "Street address": "1600 Amphitheatre Pkwy", City: "Mountain View", State: "ca", "ZIP code": "94043" };

const field = (name) => screen.getByLabelText(name);
const save = () => screen.getByRole("button", { name: /Sav(e|ing)/ });

async function fill(user, values = VALID) {
  for (const [name, value] of Object.entries(values)) {
    await user.clear(field(name));
    if (value) await user.type(field(name), value);
  }
}

describe("AddressForm validation", () => {
  it("does not show any error before the user interacts", () => {
    render(<AddressForm onSave={fn()} onClose={fn()} />);
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });

  it("shows a required error after leaving an empty field", async () => {
    const user = userEvent.setup();
    render(<AddressForm onSave={fn()} onClose={fn()} />);
    await user.click(field("Label"));
    await user.tab();
    expect(screen.getByText("Label is required")).toBeInTheDocument();
    expect(screen.queryByText("City is required")).not.toBeInTheDocument();
  });

  it("rejects a malformed ZIP but accepts 5-digit and ZIP+4 codes", async () => {
    const user = userEvent.setup();
    render(<AddressForm onSave={fn()} onClose={fn()} />);
    await user.type(field("ZIP code"), "abc");
    await user.tab();
    expect(screen.getByText("Enter a valid ZIP code (12345 or 12345-6789)")).toBeInTheDocument();

    await user.clear(field("ZIP code"));
    await user.type(field("ZIP code"), "94043-1234");
    await user.tab();
    expect(screen.queryByText(/valid ZIP/)).not.toBeInTheDocument();

    await user.clear(field("ZIP code"));
    await user.type(field("ZIP code"), "94043");
    await user.tab();
    expect(screen.queryByText(/valid ZIP/)).not.toBeInTheDocument();
  });

  it("requires a 2-letter state code", async () => {
    const user = userEvent.setup();
    render(<AddressForm onSave={fn()} onClose={fn()} />);
    await user.type(field("State"), "California");
    await user.tab();
    expect(screen.getByText("Use the 2-letter state code")).toBeInTheDocument();
  });

  it("validates latitude and longitude ranges (boundaries are allowed)", async () => {
    const user = userEvent.setup();
    render(<AddressForm onSave={fn()} onClose={fn()} />);
    await user.type(field("Latitude"), "95");
    await user.tab();
    expect(screen.getByText("Latitude must be between -90 and 90")).toBeInTheDocument();
    await user.clear(field("Latitude"));
    await user.type(field("Latitude"), "90");
    await user.tab();
    expect(screen.queryByText(/Latitude must/)).not.toBeInTheDocument();

    await user.type(field("Longitude"), "-181");
    await user.tab();
    expect(screen.getByText("Longitude must be between -180 and 180")).toBeInTheDocument();
  });

  it("shows every error and does not save when an empty form is submitted", async () => {
    const user = userEvent.setup();
    const onSave = fn();
    render(<AddressForm onSave={onSave} onClose={fn()} />);
    await user.click(save());
    expect(screen.getByText("Label is required")).toBeInTheDocument();
    expect(screen.getByText("ZIP code is required")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe("AddressForm submit", () => {
  it("saves clean data with a real boolean isDefault, upper-case state and numeric coordinates", async () => {
    const user = userEvent.setup();
    const onSave = fn(() => Promise.resolve());
    const onClose = fn();
    render(<AddressForm onSave={onSave} onClose={onClose} />);
    await fill(user);
    await user.click(screen.getByLabelText("Set as default address"));
    await user.click(save());
    expect(onSave).toHaveBeenCalledWith({
      label: "Home",
      address: "1600 Amphitheatre Pkwy",
      city: "Mountain View",
      state: "CA",
      zip: "94043",
      isDefault: true,
      lat: 0,
      lng: 0,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables the button and ignores a second submit while saving", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onSave = fn(() => pending.promise);
    render(<AddressForm onSave={onSave} onClose={fn()} />);
    await fill(user);
    await user.click(save());
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();

    fireEvent.submit(screen.getByRole("form", { name: "Address form" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("shows an error and re-enables the form when saving fails", async () => {
    const user = userEvent.setup();
    const onClose = fn();
    render(<AddressForm onSave={() => Promise.reject(new Error("500"))} onClose={onClose} />);
    await fill(user);
    await user.click(save());
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save address");
    expect(screen.getByRole("button", { name: "Save address" })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
