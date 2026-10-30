// src/Demo.jsx — read-only. The live preview renders this file's default export.
import { useState } from "react";
import Button from "./components/ui/Button";

export default function Demo() {
  const [count, setCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const bump = () => setCount((c) => c + 1);

  return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-app-text-light">
        Counter: <b data-testid="count" className="text-app-green">{count}</b>. Loading and disabled buttons must not
        change it.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button onClick={bump} aria-label="Add one">Add one</Button>
        <Button variant="secondary" onClick={bump}>Filters</Button>
        <Button variant="danger" onClick={bump} disabled>Delete</Button>
        <Button onClick={bump} loading>Save</Button>
      </div>

      <Button className="w-full" onClick={bump}>Full width</Button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="rounded-2xl border border-app-border bg-white p-4"
      >
        <p className="mb-2 text-sm">A form with a plain (non-submit) button:</p>
        <Button variant="secondary">Apply</Button>
        {submitted && <p className="mt-2 text-sm font-semibold text-app-error">Form submitted</p>}
      </form>
    </div>
  );
}
