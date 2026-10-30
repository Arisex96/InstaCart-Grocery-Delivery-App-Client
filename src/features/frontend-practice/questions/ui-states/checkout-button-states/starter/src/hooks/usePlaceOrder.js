// src/hooks/usePlaceOrder.js — wraps POST /orders, the same call Checkout.tsx makes.
// The fake api (src/api/axios.js) answers { data: { orderId, status, total } } and rejects with
// error.response.data.message when stock changed or the server fails.
//
// status: "idle" -> "submitting" -> "success" | "error"
// Ops reported duplicate orders and a button that "does nothing" after an error.
import { useState } from "react";
import api from "../api/axios";

const usePlaceOrder = () => {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const placeOrder = async (payload) => {
    setStatus("submitting");
    try {
      const { data } = await api.post("/orders", payload);
      setStatus("success");
      return data;
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  return { placeOrder, status, error };
};

export default usePlaceOrder;
