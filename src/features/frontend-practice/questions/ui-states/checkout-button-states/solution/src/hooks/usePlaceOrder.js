// src/hooks/usePlaceOrder.js — wraps POST /orders, the same call Checkout.tsx makes.
// The fake api (src/api/axios.js) answers { data: { orderId, status, total } } and rejects with
// error.response.data.message when stock changed or the server fails.
//
// status: "idle" -> "submitting" -> "success" | "error"
// Ops reported duplicate orders and a button that "does nothing" after an error.
import { useRef, useState } from "react";
import api from "../api/axios";

const usePlaceOrder = () => {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  // ROOT CAUSE (duplicates): there was no re-entry guard, and state could not provide one anyway:
  // two calls in the same tick both see the old `status`. FIX: a ref is updated synchronously.
  const inFlight = useRef(false);

  const placeOrder = async (payload) => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    setError(null); // FIX: an old error must not survive into a new attempt
    setStatus("submitting");
    try {
      const { data } = await api.post("/orders", payload);
      setStatus("success");
      return data;
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong. Please try again.");
      // ROOT CAUSE (stuck button): the catch never left "submitting". FIX: a retryable status.
      setStatus("error");
      return undefined;
    } finally {
      inFlight.current = false;
    }
  };

  return { placeOrder, status, error };
};

export default usePlaceOrder;
