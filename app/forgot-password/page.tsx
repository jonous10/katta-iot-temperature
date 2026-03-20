"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) setSent(true);
    else alert("Something went wrong");
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Reset your password</h2>

        {sent ? (
          <p className="text-green-600">
            If this email exists, a reset link has been sent.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="you@example.com"
              className="border p-3 rounded w-full mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="clean-blue-fade text-white w-full py-3 rounded">
              Send reset link
            </button>
          </>
        )}
      </form>
    </div>
  );
}
