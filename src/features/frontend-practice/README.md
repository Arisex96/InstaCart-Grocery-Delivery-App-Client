# Frontend Practice Lab

A self-contained learning module served at `/practice` (and `/practice/:id`). It has no
connection to store data, APIs, auth or the cart; the only change outside this folder is the
lazy route in `src/App.tsx`.

## What the workspace offers

- **CodeMirror 6 editor** (JSX highlighting, line numbers, bracket matching/closing, indentation,
  history, search) with **file tabs**: exercises are multi-file workspaces that mirror the real app
  (`src/components/ProductCard.jsx`, `src/store/useCartStore.js`, …). Context files are read-only.
- **Compile diagnostics**: syntax errors are underlined in the editor and listed with `file:line:col`.
- **Run**: executes the *current editor contents* in the sandbox and renders the preview.
- **Preview / Console / Tests** tabs, plus a draggable (and keyboard-resizable) editor splitter.
  The preview stays mounted while other tabs are open; **Restart preview** boots a fresh sandbox.
- **Console** captures `console.log/info/warn/error` (including React warnings and uncaught errors)
  from the preview and from test runs.
- **Run Tests**: real per-test pass/fail with assertion messages.
- Runtime errors show the message and a stack trace whose line numbers match your source.
- Hints are progressive; the solution is a separate reveal and **never** marks an exercise solved.
  Edits survive navigation and reloads (localStorage). Exercises are *not started* → *attempted*
  (edited / run / tested) → *solved* (all tests pass).

## How code runs

Learner code is **never executed on the server or in the host page**.

1. The host transpiles JSX with Sucrase (`runner/transpile.ts`); it only parses, never runs it.
2. The result is posted to an `<iframe sandbox="allow-scripts allow-forms">` with an opaque origin
   (no `allow-same-origin`) and a CSP of `default-src 'none'` — no access to the host DOM, storage,
   cookies or auth tokens, and no network (`runner/sandbox.ts`).
3. Inside the iframe, `runtime.bundle.js` (React, react-router-dom, zustand, react-hot-toast, a
   curated lucide-react icon subset, Testing Library, the assertion library and test engine, and a
   tiny module system for the exercise's files) evaluates the code and posts results back.
4. The preview is styled with Tailwind (`@tailwindcss/browser`) and the app's design tokens, so
   exercise code uses the real InstaCart class names. The preview gets its own `MemoryRouter` and
   toast host, so it never touches the real URL.

Why not Sandpack? It loads its bundler from a CDN and needs network access; this sandbox is offline,
CSP-locked, and already covered by tests. Limitation: a synchronous infinite loop cannot be
pre-empted from the host. A test run is abandoned after 20 s and its iframe removed, but a runaway
*preview* can keep that frame busy until you press **Restart preview**.

`runtime.bundle.js` is generated. After changing anything in `runner/` that the iframe uses
(`engine.ts`, `expect.ts`, `externals.ts`, `modules.ts`, `console.ts`, `runtime/entry.ts`), rebuild:

```
npm run build:practice-runtime
```

## Adding an exercise

Create `questions/<topic>/<id>/`:

| Path           | Purpose                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| `meta.ts`      | `defineExercise({...})`: scenario, repro steps, acceptance criteria, hints, explanation, `inspiredBy`, `editableFiles`, `shared`, `previewEntry`, `expectedFailures` |
| `starter/**`   | The workspace the learner sees (paths mirror the app). Non-editable files are read-only context, e.g. `src/Demo.jsx` |
| `solution/**`  | Corrected versions of the editable files, commented with ROOT CAUSE / FIX        |
| `tests.jsx`    | Hidden tests (fix mode); import files as `./src/...` and helpers from `./testing/utils` |

`questions/_shared/` holds fixtures every exercise can include via `meta.shared`: sample products
(real schema), a fake `src/api/axios.js` with the real response shape, the cart store,
`useDebounce` and `ProductCard`. `questions/_shared/testing/` are test-only helpers.

UI exercises set `previewEntry` (a file whose default export demos the bug). Logic exercises omit it;
Run executes the file and shows its `console.log` output. `mode: "write-tests"` exercises ask the
learner to write the tests: they must pass on the untouched code and fail on every seeded `mutants`
entry.

`npm test` verifies every exercise: the starter fails the tests named in `expectedFailures`, the
solution passes everything, previews render, and every `inspiredBy` file exists in the repo.

## Sharing the lab with friends

The lab needs no backend: it runs entirely in the browser, so a deployed copy of the client is all anyone needs.

- **Link:** every question has a deep link, `https://<your-host>/practice/<question-id>`. Use the **Copy link** button in the lab header to copy the current one. `vercel.json` already rewrites every path to `index.html`, so these links work on Vercel.
- **Host it:** push the repo to GitHub, import it in Vercel (root directory `client`, framework Vite) and share `https://<project>.vercel.app/practice`. Progress and edits are saved per browser, so friends never overwrite each other.
- **Run locally:** `git clone <repo> && cd client && npm install && npm run practice` opens the lab at `/practice`.
