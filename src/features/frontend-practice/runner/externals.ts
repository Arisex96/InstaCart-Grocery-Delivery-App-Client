import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as JsxRuntime from "react/jsx-runtime";
import * as ReactRouterDom from "react-router-dom";
import * as Zustand from "zustand";
import * as ReactHotToast from "react-hot-toast";
import * as TestingLibraryReact from "@testing-library/react";
import * as TestingLibraryDom from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import * as Lucide from "./lucide";

/** Wraps a namespace so Sucrase's `_interopRequireDefault` sees `default`. */
const esm = (ns: object, def?: unknown) => {
  const asRecord = ns as Record<string, unknown>;
  return { ...asRecord, default: def ?? asRecord.default ?? ns, __esModule: true };
};

/**
 * Bare-specifier imports available to learner code and exercise tests. Shared
 * by the sandbox runtime bundle and the vitest verification suite. These are the
 * packages the real app uses, so exercise code can import them exactly like
 * the InstaCart source does. (axios is replaced by a fake `src/api/axios.js`
 * file inside each exercise — the sandbox has no network.)
 */
export const externals: Record<string, unknown> = {
  react: esm(React),
  "react/jsx-runtime": esm(JsxRuntime),
  "react-dom": esm(ReactDOM),
  "react-dom/client": esm(ReactDOMClient),
  "react-router-dom": esm(ReactRouterDom),
  "react-router": esm(ReactRouterDom),
  zustand: esm(Zustand),
  "react-hot-toast": esm(ReactHotToast, ReactHotToast.default),
  "lucide-react": esm(Lucide),
  "@testing-library/react": esm(TestingLibraryReact),
  "@testing-library/dom": esm(TestingLibraryDom),
  "@testing-library/user-event": esm({ userEvent }, userEvent),
};

export const cleanup = () => TestingLibraryReact.cleanup();
