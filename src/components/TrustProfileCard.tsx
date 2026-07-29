import { TrustBadge, VerificationLevel, badgeLabel, verificationLabel } from "@/lib/trust";

export interface TrustProfile {
  displayName: string;
  role: "host" | "guest";
  verification: VerificationLevel;
  badges: TrustBadge[];
  /** Average overall 1–5 */
  ratingAverage?: number;
  ratingCount?: number;
  /** Short dimension highlights */
  highlights?: { label: string; score: number }[];
  memberSince?: string;
}

/** Example profiles for UI until real accounts exist */
export const EXAMPLE_HOST_PROFILE: TrustProfile = {
  displayName: "Ridge host",
  role: "host",
  verification: "id_verified",
  badges: ["id_verified", "accurate_listing", "quiet_stay", "responsive_host"],
  ratingAverage: 4.9,
  ratingCount: 12,
  highlights: [
    { label: "Matched listing", score: 5.0 },
    { label: "Privacy", score: 4.9 },
    { label: "Quiet", score: 5.0 },
  ],
  memberSince: "2026",
};

export const EXAMPLE_GUEST_PROFILE: TrustProfile = {
  displayName: "Verified guest",
  role: "guest",
  verification: "id_verified",
  badges: ["id_verified", "leave_no_trace", "super_guest", "property_care"],
  ratingAverage: 4.8,
  ratingCount: 7,
  highlights: [
    { label: "Respected land", score: 5.0 },
    { label: "Respected quiet", score: 4.9 },
  ],
  memberSince: "2025",
};

export function TrustProfileCard({
  profile,
  example = false,
}: {
  profile: TrustProfile;
  /** When true, clearly mark as UI sample (DC-1: not real reputation). */
  example?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        example
          ? "border-dashed border-forest-300 bg-forest-50/50"
          : "border-forest-100 bg-white"
      }`}
    >
      {example && (
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-3">
          Example only — not a real host or guest score
        </p>
      )}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-forest-500">
            {profile.role === "host" ? "Host" : "Guest"}
            {example ? " (sample)" : ""}
          </p>
          <h3 className="font-semibold text-forest-900 text-lg">{profile.displayName}</h3>
          {profile.memberSince && (
            <p className="text-xs text-forest-500">On Immerse since {profile.memberSince}</p>
          )}
        </div>
        {profile.ratingAverage != null && (
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-forest-900">{profile.ratingAverage.toFixed(1)}</p>
            <p className="text-xs text-forest-500">
              {profile.ratingCount} rating{profile.ratingCount === 1 ? "" : "s"}
            </p>
          </div>
        )}
      </div>

      <p className="text-sm font-medium text-emerald-800 mb-3">
        {verificationLabel(profile.verification)}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {profile.badges.map((b) => (
          <span
            key={b}
            className="text-xs bg-forest-50 text-forest-800 px-2.5 py-1 rounded-full border border-forest-100"
          >
            {badgeLabel(b)}
          </span>
        ))}
      </div>

      {profile.highlights && profile.highlights.length > 0 && (
        <ul className="text-sm text-forest-700 space-y-1">
          {profile.highlights.map((h) => (
            <li key={h.label} className="flex justify-between gap-2">
              <span>{h.label}</span>
              <span className="font-medium text-forest-900">{h.score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
