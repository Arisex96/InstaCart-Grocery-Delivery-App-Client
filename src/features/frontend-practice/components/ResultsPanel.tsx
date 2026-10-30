import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { TestReport } from "../runner/engine";

interface ResultsPanelProps {
  report?: TestReport;
  running: boolean;
}

export default function ResultsPanel({ report, running }: ResultsPanelProps) {
  if (running) {
    return (
      <div role="status" className="flex items-center gap-2 p-4 text-sm text-app-text-light">
        <Loader2 className="size-4 animate-spin" /> Running tests in the sandbox…
      </div>
    );
  }
  if (!report) {
    return <p className="p-4 text-sm text-app-text-light">Press “Run Tests” to check your code against the exercise's tests.</p>;
  }
  if (report.error) {
    return (
      <div role="alert" className="p-4">
        <p className="mb-1 text-sm font-semibold text-app-error">Couldn't run the tests</p>
        <pre className="whitespace-pre-wrap rounded-lg bg-red-50 p-3 font-mono text-xs text-red-900">{report.error}</pre>
        {report.errorStack && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer text-red-800">Stack trace</summary>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-red-50 p-3 font-mono text-[11px] text-red-900">
              {report.errorStack}
            </pre>
          </details>
        )}
      </div>
    );
  }
  const passed = report.results.filter((r) => r.status === "pass").length;
  const total = report.results.length;
  const allPassed = passed === total;
  return (
    <div className="p-4" data-testid="results">
      <p role="status" className={`mb-3 text-sm font-semibold ${allPassed ? "text-app-success" : "text-app-error"}`}>
        {allPassed ? `All ${total} tests passed 🎉` : `${passed} of ${total} tests passed`}
      </p>
      <ul className="space-y-2">
        {report.results.map((r) => (
          <li
            key={`${r.suite}|${r.name}`}
            data-status={r.status}
            className={`rounded-lg border p-3 text-sm ${
              r.status === "pass" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-2">
              {r.status === "pass" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-app-success" aria-label="passed" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-app-error" aria-label="failed" />
              )}
              <div className="min-w-0">
                {r.suite && <span className="text-xs text-app-text-light">{r.suite} › </span>}
                <span className="font-medium">{r.name}</span>
                {r.message && (
                  <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-red-900">{r.message}</pre>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
