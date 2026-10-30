import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import DeliveryInstructionsForm from "./src/components/DeliveryInstructionsForm";

const option = (label) => screen.getByLabelText(label);
const save = () => screen.getByRole("button", { name: /Sav(e|ing)/ });
const GATE_ERROR = "Enter a gate code of 4 to 6 digits";

describe("DeliveryInstructionsForm fields", () => {
  it("shows the extra field only for the matching option", async () => {
    const user = userEvent.setup();
    render(<DeliveryInstructionsForm onSubmit={fn()} />);
    expect(screen.queryByLabelText("Gate code")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Meeting spot")).not.toBeInTheDocument();

    await user.click(option("Leave at door"));
    expect(screen.getByLabelText("Gate code")).toBeInTheDocument();
    expect(screen.queryByLabelText("Meeting spot")).not.toBeInTheDocument();

    await user.click(option("Meet outside"));
    expect(screen.getByLabelText("Meeting spot")).toBeInTheDocument();
    expect(screen.queryByLabelText("Gate code")).not.toBeInTheDocument();
  });

  it("lets Hand to me be submitted without any extra field", async () => {
    const user = userEvent.setup();
    const onSubmit = fn(() => Promise.resolve());
    render(<DeliveryInstructionsForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Notes for the driver"), "  Ring twice ");
    await user.click(save());
    expect(onSubmit).toHaveBeenCalledWith({ option: "hand", notes: "Ring twice" });
  });

  it("requires a gate code of 4 to 6 digits for Leave at door", async () => {
    const user = userEvent.setup();
    const onSubmit = fn(() => Promise.resolve());
    render(<DeliveryInstructionsForm onSubmit={onSubmit} />);
    await user.click(option("Leave at door"));

    for (const bad of ["", "12", "1234567", "12ab"]) {
      await user.clear(screen.getByLabelText("Gate code"));
      if (bad) await user.type(screen.getByLabelText("Gate code"), bad);
      await user.click(save());
      expect(screen.getByText(GATE_ERROR)).toBeInTheDocument();
    }
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Gate code"));
    await user.type(screen.getByLabelText("Gate code"), "4321");
    await user.click(save());
    expect(onSubmit).toHaveBeenCalledWith({ option: "door", gateCode: "4321", notes: "" });
  });

  it("requires a meeting spot for Meet outside", async () => {
    const user = userEvent.setup();
    const onSubmit = fn(() => Promise.resolve());
    render(<DeliveryInstructionsForm onSubmit={onSubmit} />);
    await user.click(option("Meet outside"));
    await user.click(save());
    expect(screen.getByText("Enter a meeting spot")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Meeting spot"), "Lobby");
    await user.click(save());
    expect(onSubmit).toHaveBeenCalledWith({ option: "outside", meetingSpot: "Lobby", notes: "" });
  });

  it("does not submit a hidden gate code after switching to Hand to me", async () => {
    const user = userEvent.setup();
    const onSubmit = fn(() => Promise.resolve());
    render(<DeliveryInstructionsForm onSubmit={onSubmit} />);
    await user.click(option("Leave at door"));
    await user.type(screen.getByLabelText("Gate code"), "4321");
    await user.click(option("Hand to me"));
    await user.click(save());
    expect(onSubmit).toHaveBeenCalledWith({ option: "hand", notes: "" });

    await user.click(option("Leave at door"));
    expect(screen.getByLabelText("Gate code")).toHaveValue(""); // the old value is gone
  });

  it("rejects notes longer than 120 characters but accepts exactly 120", async () => {
    const user = userEvent.setup();
    const onSubmit = fn(() => Promise.resolve());
    render(<DeliveryInstructionsForm onSubmit={onSubmit} />);
    const notes = screen.getByLabelText("Notes for the driver");
    fireEvent.change(notes, { target: { value: "a".repeat(121) } });
    await user.click(save());
    expect(screen.getByText("Notes can be at most 120 characters")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(notes, { target: { value: "a".repeat(120) } });
    await user.click(save());
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("DeliveryInstructionsForm errors and submitting", () => {
  it("clears errors when the delivery option changes", async () => {
    const user = userEvent.setup();
    render(<DeliveryInstructionsForm onSubmit={fn()} />);
    await user.click(option("Leave at door"));
    await user.click(save());
    expect(screen.getByText(GATE_ERROR)).toBeInTheDocument();

    await user.click(option("Meet outside"));
    // The error of the option we left must be gone, and the newly shown field starts clean.
    expect(screen.queryByText(GATE_ERROR)).not.toBeInTheDocument();
    expect(screen.queryByText("Enter a meeting spot")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces errors to screen readers and links them to their input", async () => {
    const user = userEvent.setup();
    render(<DeliveryInstructionsForm onSubmit={fn()} />);
    await user.click(option("Leave at door"));
    await user.click(save());

    const input = screen.getByLabelText("Gate code");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const message = document.getElementById(describedBy);
    expect(message).toHaveTextContent(GATE_ERROR);
    expect(screen.getByRole("alert")).toBe(message);
  });

  it("ignores a second submit while the first one is still pending", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onSubmit = fn(() => pending.promise);
    render(<DeliveryInstructionsForm onSubmit={onSubmit} />);
    await user.click(save());
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();

    fireEvent.submit(screen.getByRole("form", { name: "Delivery instructions" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows a form-level error and re-enables the button when saving fails", async () => {
    const user = userEvent.setup();
    render(<DeliveryInstructionsForm onSubmit={() => Promise.reject(new Error("500"))} />);
    await user.click(save());
    expect(await screen.findByText(/could not save your instructions/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save instructions" })).toBeEnabled();
  });
});
