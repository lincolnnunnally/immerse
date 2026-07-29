/** Extract a YouTube video id from common URL shapes. */

export function extractYoutubeId(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  // bare id
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const parts = u.pathname.split("/").filter(Boolean);
      // /embed/ID /shorts/ID /live/ID
      if (parts.length >= 2 && ["embed", "shorts", "live", "v"].includes(parts[0])) {
        const id = parts[1];
        if (/^[\w-]{11}$/.test(id)) return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}
