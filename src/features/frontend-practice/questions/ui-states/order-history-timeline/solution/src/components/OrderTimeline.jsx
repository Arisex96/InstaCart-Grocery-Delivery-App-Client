// src/components/OrderTimeline.jsx — the delivery progress stepper shown inside an expanded order
// (the real app draws a similar one on client/src/pages/OrderTracking.tsx).
//
// APPROACH: colour alone must not carry meaning. Every step says what it is in text
// (visually hidden for sighted users): completed / current / upcoming, and the current step is
// marked with aria-current="step", which screen readers announce natively.
import { Check } from "lucide-react";
import { stepStates } from "../lib/orderUtils";

const OrderTimeline = ({ status }) => {
  const steps = stepStates(status);

  if (status === "cancelled") {
    return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">Order cancelled</p>;
  }

  return (
    <ol aria-label="Order progress" className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {steps.map((step, i) => (
        <li
          key={step.key}
          aria-current={step.state === "current" ? "step" : undefined}
          className="flex flex-1 items-center gap-2 sm:flex-col sm:gap-1.5 sm:text-center"
        >
          <span
            aria-hidden="true"
            className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
              step.state === "completed"
                ? "border-app-green bg-app-green text-white"
                : step.state === "current"
                  ? "border-app-orange bg-orange-50 text-app-orange"
                  : "border-app-border bg-white text-app-text-light"
            }`}
          >
            {step.state === "completed" ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={`text-sm ${step.state === "upcoming" ? "text-app-text-light" : "font-semibold text-app-text"}`}>
            {step.label}
            <span className="sr-only"> {step.state}</span>
          </span>
        </li>
      ))}
    </ol>
  );
};

export default OrderTimeline;
