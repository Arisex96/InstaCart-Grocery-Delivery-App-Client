import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import LoginForm from "./src/components/LoginForm";
import api from "./src/api/axios";

const realPost = api.post;
let post;

beforeEach(() => {
  post = fn();
  api.post = post;
});
afterEach(() => {
  api.post = realPost;
});

const email = () => screen.getByLabelText("Email");
const password = () => screen.getByLabelText("Password");
const submitButton = () => screen.getByRole("button", { name: /Sign/ });
const USER = { id: "u1", name: "Ana", email: "ana@example.com" };

async function fill(user, e = "ana@example.com", p = "secret123") {
  if (e) await user.type(email(), e);
  if (p) await user.type(password(), p);
}

describe("LoginForm", () => {
  it("hides the password by default", () => {
    render(<LoginForm onSuccess={fn()} />);
    expect(password()).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("Show / Hide toggles the password input and its label", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={fn()} />);
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password()).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password()).toHaveAttribute("type", "password");
  });

  it("prevents the default form submit (no page reload)", () => {
    post.mockResolvedValue({ data: { user: USER } });
    render(<LoginForm onSuccess={fn()} />);
    // fireEvent returns false when a handler called preventDefault().
    expect(fireEvent.submit(screen.getByRole("form", { name: "Sign in" }))).toBe(false);
  });

  it("sends the trimmed, lower-cased email and the untouched password, then calls onSuccess", async () => {
    const user = userEvent.setup();
    post.mockResolvedValue({ data: { token: "t", user: USER } });
    const onSuccess = fn();
    render(<LoginForm onSuccess={onSuccess} />);
    await fill(user, "  ANA@Example.com ", " Secret 123 ");
    await user.click(submitButton());
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/auth/login", { email: "ana@example.com", password: " Secret 123 " });
    expect(onSuccess).toHaveBeenCalledWith(USER);
  });

  it("does not call the API for blank fields and explains why", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={fn()} />);
    await user.click(submitButton());
    expect(screen.getByRole("alert")).toHaveTextContent("Email and password are required");

    await fill(user, "   ", "secret123");
    await user.click(submitButton());
    expect(post).not.toHaveBeenCalled();
  });

  it("disables the button while pending and ignores a second submit", async () => {
    const user = userEvent.setup();
    const request = deferred();
    post.mockImplementation(() => request.promise);
    render(<LoginForm onSuccess={fn()} />);
    await fill(user);
    await user.click(submitButton());
    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();

    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
    expect(post).toHaveBeenCalledTimes(1);

    await act(async () => request.resolve({ data: { user: USER } }));
  });

  it("shows the server message inline and re-enables the button after a failed login", async () => {
    const user = userEvent.setup();
    post.mockRejectedValue({ response: { data: { message: "Invalid email or password" } } });
    render(<LoginForm onSuccess={fn()} />);
    await fill(user);
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("falls back to a generic message and clears the error on the next attempt", async () => {
    const user = userEvent.setup();
    const retry = deferred();
    let attempt = 0;
    post.mockImplementation(() => (attempt++ === 0 ? Promise.reject(new Error("Network Error")) : retry.promise));
    render(<LoginForm onSuccess={fn()} />);
    await fill(user);
    await user.click(submitButton());
    expect(await screen.findByRole("alert")).toHaveTextContent("Login failed");

    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(async () => retry.resolve({ data: { user: USER } }));
  });
});
