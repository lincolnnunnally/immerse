/**
 * Hero / card photo for a campsite. Uses official Recreation.gov CDN when we
 * have it; otherwise an honest nature placeholder (never a fake photo of the site).
 */

type Props = {
  src?: string | null;
  alt: string;
  /** card = landscape strip; hero = site page */
  variant?: "card" | "hero";
  className?: string;
};

export function SitePhoto({ src, alt, variant = "card", className = "" }: Props) {
  const height = variant === "hero" ? "h-56 sm:h-72 md:h-80" : "h-40 sm:h-44";

  if (src) {
    return (
      <div className={`relative w-full ${height} overflow-hidden bg-forest-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${height} overflow-hidden bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950 ${className}`}
      role="img"
      aria-label={`${alt} — no photo available yet`}
    >
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTQgMi0yIDItNGgtMnYyYzAgMi0yIDQtMiA0czIgMiAyIDQtMiAyLTIgNGgydi0yem0tMjAgMGMwLTIgMi00IDItNHMtMi0yLTItNCAyLTIgMi00aC0ydjJjMCAyLTIgNC0yIDRzMiAyIDIgNC0yIDItMiA0aDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <span className="text-3xl mb-2" aria-hidden>
          🌲
        </span>
        <span className="text-xs sm:text-sm text-forest-100/90 font-medium">
          No photo yet — open details &amp; Recreation.gov for more
        </span>
      </div>
    </div>
  );
}
