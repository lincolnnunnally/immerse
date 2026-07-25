"use client";

import { useEffect, useState } from "react";
import { createImmerseClient, isSupabaseConfigured } from "@/lib/supabase";
import { clearSavedCache } from "@/lib/trips";

export default function AccountPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/trips");

  useEffect(() => {
    const sb = createImmerseClient();
    // Already signed in? Go where they were headed.
    const params = new URLSearchParams(window.location.search);
    const dest = params.get("next");
    if (dest && dest.startsWith("/")) setNext(dest);
    sb?.auth.getSession().then(({ data }) => {
      if (data.session?.user) window.location.href = dest && dest.startsWith("/") ? dest : "/trips";
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sb = createImmerseClient();
    if (!sb) return;
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName: name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Could not create your account.");
          return;
        }
      }
      const { error: signInError } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) {
        setError(
          mode === "signup"
            ? "Account created, but sign-in failed. Try signing in."
            : "That email and password did not match. Try again."
        );
        return;
      }
      clearSavedCache();
      window.location.href = next;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-forest-600">
        Accounts aren&apos;t connected yet. Please try again shortly.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">🌲</div>
        <h1 className="text-2xl font-bold text-forest-900">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-forest-600 mt-2">
          Save trips and plan real time in nature. Your account works across the
          whole Life Produces Life family.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-forest-100 p-6 shadow-sm space-y-3"
      >
        {mode === "signup" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name (optional)"
            className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-300"
          />
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-300"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (8+ characters)"
          className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-300"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full px-5 py-3 rounded-xl bg-forest-700 text-white font-semibold hover:bg-forest-800 disabled:opacity-50 transition"
        >
          {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-forest-600 mt-4">
        {mode === "signup" ? "Already have an account?" : "New to Immerse?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError("");
          }}
          className="text-forest-800 font-medium hover:underline"
        >
          {mode === "signup" ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}
