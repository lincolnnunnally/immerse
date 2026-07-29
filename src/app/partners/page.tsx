"use client";

import Link from "next/link";
import { useState } from "react";

export default function PartnersPage() {
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [parkSystem, setParkSystem] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          contactName,
          email,
          phone,
          parkSystem,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not submit. Try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not submit. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-forest-900 mb-3">Thanks — interest received</h1>
        <p className="text-forest-700 mb-8">
          We&apos;ll follow up about adventure marketing, visitor storytelling, and honest
          partnership options. No contract is formed by this form.
        </p>
        <Link href="/adventures" className="text-forest-700 font-medium underline">
          See adventure videos →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <p className="text-sm text-forest-500 mb-2">For parks, forests & land managers</p>
      <h1 className="text-3xl font-bold text-forest-900 mb-3">
        Adventure marketing that sends people outside
      </h1>
      <p className="text-forest-700 leading-relaxed mb-6">
        Immerse helps people find places to camp and get into nature — and visitors can share
        YouTube adventure videos from real trips. State parks, national forests, and recreation
        areas can partner so those stories highlight{" "}
        <strong>your</strong> sites: clearer demand, better visitor prep, and authentic marketing
        without hollow ads.
      </p>

      <section className="rounded-2xl border border-forest-100 bg-forest-50 p-6 mb-8 text-sm text-forest-800 space-y-3">
        <h2 className="font-semibold text-forest-900 text-base">What partnership can look like</h2>
        <ul className="list-disc ml-5 space-y-2">
          <li>Featured placement for priority parks / forests in search results</li>
          <li>Co-created adventure video series filmed with Leave No Trace standards</li>
          <li>Visitor tips that reduce bad arrivals (passes, roads, closures)</li>
          <li>
            Paid marketing retainers or campaign packages when budgets exist —{" "}
            <em>we do not claim you already pay us</em>; this form starts the conversation
          </li>
        </ul>
        <p className="text-forest-600">
          Revenue from public-land marketing is optional and contract-based. Private nature stays
          are a separate track with hard caps so land stays nature.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-forest-900 mb-2">Tell us you&apos;re interested</h2>
        <input
          required
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Organization / park unit"
          className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm"
        />
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Contact name"
          className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email"
          className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm"
        />
        <input
          value={parkSystem}
          onChange={(e) => setParkSystem(e.target.value)}
          placeholder="System (e.g. State Parks, USFS, city rec)"
          className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="What would good look like for your visitors?"
          className="w-full rounded-xl border border-forest-200 px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Submit interest"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-forest-500">
        Visitors:{" "}
        <Link href="/adventures" className="underline">
          share adventure videos
        </Link>{" "}
        ·{" "}
        <Link href="/search" className="underline">
          find a place to go
        </Link>
      </p>
    </div>
  );
}
