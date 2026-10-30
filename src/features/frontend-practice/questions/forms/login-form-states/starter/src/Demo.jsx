// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The fake login endpoint below accepts ana@example.com / secret123 after 700 ms and rejects
// anything else with { message: "Invalid email or password" }. It logs every request it receives
// to the Console tab so you can inspect exactly what LoginForm sends.
import { useState } from "react";
import LoginForm from "./components/LoginForm";
import api from "./api/axios";

api.post = async (url, body) => {
  console.log("POST", url, JSON.stringify(body));
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (body.email === "ana@example.com" && body.password === "secret123") {
    return { data: { token: "demo-token", user: { id: "u1", name: "Ana", email: body.email } } };
  }
  const error = new Error("Request failed with status code 401");
  error.response = { status: 401, data: { message: "Invalid email or password" } };
  throw error;
};

export default function Demo() {
  const [user, setUser] = useState(null);

  if (user) {
    return (
      <p className="rounded-2xl bg-white p-6 text-app-green shadow-sm">
        Signed in as <b>{user.name}</b> ({user.email})
      </p>
    );
  }
  return <LoginForm onSuccess={setUser} />;
}
