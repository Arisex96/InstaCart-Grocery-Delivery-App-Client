import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "login-form-states",
  title: "Sign-in form gets stuck and shows no error",
  topic: "forms",
  difficulty: "easy",
  minutes: 20,
  summary: "LoginForm never re-enables after a failed login, ignores the password toggle and sends untrimmed emails.",
  scenario:
    "Support keeps hearing the same things about sign-in: \"after I mistyped my password the button stayed grey and I had to reload\", \"I pasted my email with a trailing space and was told the account does not exist\", \"the eye icon does nothing\", and \"pressing Enter reloads the page\". There is no error text in the form at all; failures only appeared as a toast in the old version.\n\n" +
    "LoginForm is a trimmed version of the sign-in half of src/pages/Login.tsx. It calls api.post(\"/auth/login\", { email, password }) and hands the user from response.data.user to its parent via onSuccess.",
  inspiredBy: ["client/src/pages/Login.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/components/LoginForm.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The password is hidden by default; the Show/Hide button toggles it and updates its label.",
    "Submitting calls api.post(\"/auth/login\") with the email trimmed and lower-cased and the password exactly as typed, then onSuccess(user).",
    "Blank fields show \"Email and password are required\" and do not call the API.",
    "While the request is pending the button is disabled and reads \"Signing in…\"; a second submit is ignored.",
    "A failed login shows the server message (or \"Login failed\") inline, re-enables the button, and the error disappears when the shopper tries again.",
  ],
  reproSteps: [
    "Press Run and sign in with ana@example.com and a wrong password: the button stays on \"Signing in…\" and no message appears.",
    "Click the Show button next to the password: the characters stay hidden.",
    "Type \"  ANA@Example.com \" with the right password (secret123): the request is rejected because the email was not normalised.",
    "Click into the email field and press Enter: the (sandboxed) page would reload — the Console shows a warning.",
  ],
  acceptanceCriteria: [
    "No page reload on submit (preventDefault).",
    "Loading state always ends, on success and on failure.",
    "Inline error with role=\"alert\", cleared on the next attempt.",
    "Email normalised, password untouched.",
  ],
  edgeCases: [
    "Only spaces in the email",
    "Server error without a message",
    "Double click / Enter pressed twice while pending",
    "Retrying after a failure",
  ],
  hints: [
    "Walk through handleSubmit for the failing case: which lines run, and which line would put `loading` back to false?",
    "The form's onSubmit receives the event. What does the browser do with a submitted form unless you stop it?",
    "Trim and lower-case the email only in the payload you send; keep what the shopper typed in the box as is.",
    "A try/catch/finally gives one place to always end the loading state; a guard at the top of the handler stops double submits.",
  ],
  explanation: {
    rootCause:
      "The submit handler never called preventDefault, never reset `loading` after the request (there was no finally), never cleared the previous error, ignored the password-visibility state when rendering the input, and sent the raw email. Each symptom reported by support maps to one of these gaps.",
    fix: "Call e.preventDefault(), return early when already loading, validate blank fields, clear the old error, send a normalised email, set the error from the response in catch and always setLoading(false) in finally. Drive the input's type from `showPassword`.",
    takeaways: [
      "Every async handler needs a single place that ends the pending state (finally).",
      "Normalise values in the payload, not in what the user is editing.",
      "Show errors inline with role=\"alert\" so they are visible and announced.",
    ],
  },
  expectedFailures: ["Show / Hide", "re-enables", "trimmed"],
});
