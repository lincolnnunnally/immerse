"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createImmerseClient } from "@/lib/supabase";
import { clearSavedCache } from "@/lib/trips";

export function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = createImmerseClient();
    if (!sb) {
      setReady(true);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      clearSavedCache();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <span className="w-14" aria-hidden />;

  if (!user) {
    return (
      <a href="/account" className="hover:text-forest-500 transition">
        Sign in
      </a>
    );
  }

  const name =
    (user.user_metadata as { display_name?: string })?.display_name ||
    user.email?.split("@")[0] ||
    "You";

  async function signOut() {
    const sb = createImmerseClient();
    await sb?.auth.signOut();
    clearSavedCache();
    window.location.href = "/";
  }

  return (
    <button
      onClick={signOut}
      title={user.email || ""}
      className="hover:text-forest-500 transition"
    >
      Sign out ({name})
    </button>
  );
}
