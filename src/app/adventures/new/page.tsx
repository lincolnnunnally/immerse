"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createImmerseClient, isSupabaseConfigured } from "@/lib/supabase";

function NewAdventureForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [siteId, setSiteId] = useState(params.get("siteId") || "");
  const [siteName, setSiteName] = useState(params.get("siteName") || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = createImmerseClient();
    if (!sb) {
      setSignedIn(false);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session?.user));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sb = createImmerseClient();
    if (!sb) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push(
          `/account?next=${encodeURIComponent(
            `/adventures/new?siteId=${siteId}&siteName=${encodeURIComponent(siteName)}`
          )}`
        );
        return;
      }
      const res = await fetch("/api/adventures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          story,
          youtubeUrl,
          siteId: siteId || undefined,
          siteName: siteName || undefined,
          isPublic: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Could not post adventure.");
        return;
      }
      router.push("/adventures");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-forest-600">
        Accounts aren&apos;t connected yet.
      </div>
    );
  }

  if (signedIn === false) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-forest-900 mb-3">Sign in to share</h1>
        <p className="text-forest-600 mb-6">
          Adventure videos are tied to your account so we keep spam down and you can manage your
          posts.
        </p>
        <Link
          href={`/account?next=${encodeURIComponent(
            `/adventures/new?siteId=${siteId}&siteName=${encodeURIComponent(siteName)}`
          )}`}
          className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (signedIn === null) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-forest-500">Loading…</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/adventures" className="text-sm text-forest-600 hover:underline mb-6 inline-block">
        ← Adventures
      </Link>
      <h1 className="text-2xl font-bold text-forest-900 mb-2">Share an adventure video</h1>
      <p className="text-sm text-forest-600 mb-8">
        Upload to YouTube first (public or unlisted), then paste the link here. Record on your
        phone in the field — no special gear required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="text-forest-700 font-medium">YouTube URL</span>
          <input
            required
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtu.be/… or youtube.com/watch?v=…"
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-700 font-medium">Title</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunrise at Desoto Falls"
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-700 font-medium">Place name (optional)</span>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Campground or trail name"
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2.5"
          />
        </label>
        <input type="hidden" value={siteId} onChange={(e) => setSiteId(e.target.value)} />
        <label className="block text-sm">
          <span className="text-forest-700 font-medium">Story (optional)</span>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={4}
            placeholder="What did it feel like? Any tips for the next person?"
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2.5"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800 disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post adventure"}
        </button>
      </form>
    </div>
  );
}

export default function NewAdventurePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-16 text-center text-forest-500">Loading…</div>
      }
    >
      <NewAdventureForm />
    </Suspense>
  );
}
