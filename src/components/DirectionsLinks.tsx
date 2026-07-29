import {
  appleMapsDirectionsUrl,
  googleMapsDirectionsUrl,
  hasValidCoords,
  wazeDirectionsUrl,
} from "@/lib/maps";

export function DirectionsLinks({
  lat,
  lng,
  name,
  compact = false,
}: {
  lat?: number | null;
  lng?: number | null;
  name?: string;
  compact?: boolean;
}) {
  if (!hasValidCoords(lat, lng)) {
    return (
      <p className="text-sm text-forest-500">
        Coordinates not available for this listing yet.
      </p>
    );
  }

  const la = lat as number;
  const ln = lng as number;
  const label = name || "Campsite";

  const links = [
    {
      href: googleMapsDirectionsUrl(la, ln, label),
      label: "Google Maps",
      hint: "Android & web",
    },
    {
      href: appleMapsDirectionsUrl(la, ln, label),
      label: "Apple Maps",
      hint: "iPhone & Mac",
    },
    {
      href: wazeDirectionsUrl(la, ln),
      label: "Waze",
      hint: "Live traffic",
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border border-forest-200 bg-white text-forest-800 hover:border-forest-400 hover:bg-forest-50 transition"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-forest-900 mb-1">Get directions</h3>
      <p className="text-sm text-forest-600 mb-4">
        Opens in the app you already use — we don&apos;t replace Apple Maps, Google Maps, or Waze.
      </p>
      <div className="grid sm:grid-cols-3 gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-start rounded-xl border border-forest-200 px-4 py-3 hover:border-forest-400 hover:bg-forest-50 transition"
          >
            <span className="font-semibold text-forest-900 text-sm">{l.label} ↗</span>
            <span className="text-xs text-forest-500 mt-0.5">{l.hint}</span>
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-forest-500">
        Tip: download offline maps before you lose cell service in the woods.
      </p>
    </div>
  );
}
