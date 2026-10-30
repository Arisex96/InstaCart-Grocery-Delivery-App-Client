// src/components/OrderTimeline.jsx — the delivery progress stepper shown inside an expanded order
// (the real app draws a similar one on client/src/pages/OrderTracking.tsx).
//
// Props: status — placed | packed | out_for_delivery | delivered | cancelled
//
// TODO: render the steps from stepStates(status) as an ordered list (see the UI requirements for the
// exact accessibility contract: which step is aria-current, what the completed/upcoming steps say).
// TODO: a cancelled order shows "Order cancelled" instead of a timeline.
import { stepStates } from "../lib/orderUtils";

const OrderTimeline = ({ status }) => {
  const steps = stepStates(status);
  return <p className="text-sm text-app-text-light">Timeline not built yet ({steps.length} steps, {status}).</p>;
};

export default OrderTimeline;
