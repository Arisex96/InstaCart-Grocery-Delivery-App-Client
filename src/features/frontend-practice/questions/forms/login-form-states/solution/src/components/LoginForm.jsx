// src/components/LoginForm.jsx — trimmed copy of the sign-in half of client/src/pages/Login.tsx.
// Login used to report failures only with a toast; QA wants them inline in the form.
//
// Props: onSuccess(user) — called with response.data.user when the login worked.
// API: api.post("/auth/login", { email, password }) -> { data: { token, user } }
//      a failed login rejects with error.response.data.message (e.g. "Invalid email or password").
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import api from "../api/axios";

const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    // ROOT CAUSE (reload): without preventDefault the browser submits the form and reloads the page.
    e.preventDefault();
    // FIX (double submit): ignore a second submit while the first request is pending.
    if (loading) return;

    // FIX (blank fields): no request for an empty form.
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setError(""); // FIX: a new attempt clears the previous error.
    setLoading(true);
    try {
      // FIX (trimmed email): normalise in the payload only; the password is sent exactly as typed.
      const response = await api.post("/auth/login", { email: email.trim().toLowerCase(), password });
      onSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      // ROOT CAUSE (stuck button): `loading` was never reset after the request.
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Sign in"
      className="w-full max-w-sm space-y-4 rounded-2xl border border-app-border bg-white p-6 shadow-sm"
    >
      <h2 className="font-serif text-2xl font-bold text-app-green">Welcome back</h2>

      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-app-border bg-app-cream px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-zinc-700">
          Password
        </label>
        <div className="flex gap-2">
          <input
            id="login-password"
            // FIX (eye button): the input type follows the visibility state.
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-app-border bg-app-cream px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="rounded-xl border border-app-border px-3 text-xs font-semibold text-app-green"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-app-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-app-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-60"
      >
        {loading && <Loader2Icon className="size-4 animate-spin" />}
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
