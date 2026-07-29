"use client";

import { useEffect, useState } from "react";
import { createImmerseClient, isSupabaseConfigured } from "@/lib/supabase";
import { clearSavedCache } from "@/lib/trips";

export default function AccountPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "reset" | "recovery">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState("/trips");

  useEffect(() => {
    const sb = createImmerseClient();
    const params = new URLSearchParams(window.location.search);
    const dest = params.get("next");
    if (dest && dest.startsWith("/")) setNext(dest);
    if (params.get("mode") === "recovery") setMode("recovery");
    if (params.get("mode") === "reset") setMode("reset");

    // Supabase recovery links often put tokens in the hash
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("recovery");
    }

    sb?.auth.getSession().then(({ data }) => {
      if (data.session?.user && mode !== "recovery" && params.get("mode") !== "recovery") {
        window.location.href = dest && dest.startsWith("/") ? dest : "/trips";
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sb = createImmerseClient();
    if (!sb) return;
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "reset") {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "request", email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Could not request reset.");
          return;
        }
        setInfo(data.message || "Check your email for a recovery link.");
        return;
      }

      if (mode === "recovery") {
        if (password.length < 8) {
          setError("Use a password of at least 8 characters.");
          return;
        }
        const { error: upErr } = await sb.auth.updateUser({ password });
        if (upErr) {
          setError(
            "Could not set password. Open the recovery link from your email again, then try."
          );
          return;
        }
        setInfo("Password updated. You can use My Trips now.");
        clearSavedCache();
        window.location.href = next;
        return;
      }

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

  const heading =
    mode === "signup"
      ? "Create your account"
      : mode === "reset"
        ? "Reset password"
        : mode === "recovery"
          ? "Choose a new password"
          : "Welcome back";

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">🌲</div>
        <h1 className="text-2xl font-bold text-forest-900">{heading}</h1>
        <p className="text-forest-600 mt-2">
          Save trips, post adventure videos, and plan real time in nature. Your account works
          across the Life Produces Life family.
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
        {mode !== "recovery" && (
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-300"
          />
        )}
        {(mode === "signin" || mode === "signup" || mode === "recovery") && (
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === "recovery" ? "New password (8+ characters)" : "Password (8+ characters)"
            }
            className="w-full px-4 py-3 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-300"
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-emerald-700">{info}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full px-5 py-3 rounded-xl bg-forest-700 text-white font-semibold hover:bg-forest-800 disabled:opacity-50 transition"
        >
          {busy
            ? "…"
            : mode === "signup"
              ? "Create account"
              : mode === "reset"
                ? "Email recovery link"
                : mode === "recovery"
                  ? "Save new password"
                  : "Sign in"}
        </button>
      </form>

      <div className="text-center text-sm text-forest-600 mt-4 space-y-2">
        {mode === "signin" && (
          <>
            <p>
              New to Immerse?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setInfo("");
                }}
                className="text-forest-800 font-medium hover:underline"
              >
                Create one
              </button>
            </p>
            <p>
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setError("");
                  setInfo("");
                }}
                className="text-forest-800 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setInfo("");
              }}
              className="text-forest-800 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
        {(mode === "reset" || mode === "recovery") && (
          <p>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setInfo("");
              }}
              className="text-forest-800 font-medium hover:underline"
            >
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
