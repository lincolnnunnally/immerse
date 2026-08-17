import type { CampSite, LandRule, RuleStatus } from "@/lib/types";

/**
 * "What's actually allowed here" — the honest answer to a question the government
 * often answers twice, differently.
 *
 * Design rule: never collapse conflicting sources into one confident sentence. Show the
 * bottom line, then every authority that speaks to it, what each one says, when it said
 * it, and a link. Where a source is stale, self-contradictory, or outranked, say so on
 * the source itself. Where nothing settles it, give the phone number instead of a guess.
 */

function statusChip(status: RuleStatus): { label: string; cls: string } {
  switch (status) {
    case "allowed":
      return { label: "Allowed", cls: "bg-emerald-100 text-emerald-900 border-emerald-300" };
    case "prohibited":
      return { label: "Not allowed", cls: "bg-red-100 text-red-900 border-red-300" };
    case "conditional":
      return { label: "Only with conditions", cls: "bg-amber-100 text-amber-900 border-amber-300" };
    case "closed_temporarily":
      return { label: "Closed for now", cls: "bg-orange-100 text-orange-900 border-orange-300" };
    default:
      return { label: "Unclear", cls: "bg-forest-100 text-forest-800 border-forest-300" };
  }
}

function groupByActivity(rules: LandRule[]): [string, LandRule[]][] {
  const map = new Map<string, LandRule[]>();
  for (const r of rules) {
    const key = r.activity.trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries());
}

export function LandRulesPanel({ site }: { site: CampSite }) {
  const rules = site.landRules || [];
  if (rules.length === 0 && !site.rulesSummary) return null;

  const grouped = groupByActivity(rules);
  const hasCaveat = rules.some((r) => r.caveat);

  return (
    <section className="mb-8 rounded-2xl border border-forest-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="font-semibold text-forest-900 text-lg">What&apos;s actually allowed here</h2>
        <span className="text-xs text-forest-500">
          {site.jurisdictions && site.jurisdictions.length > 1
            ? `${site.jurisdictions.length} agencies govern this land`
            : "Official sources, with dates"}
        </span>
      </div>

      {site.rulesSummary && (
        <p className="text-forest-900 leading-relaxed mb-4 pb-4 border-b border-forest-100">
          {site.rulesSummary}
        </p>
      )}

      {/* Overlapping jurisdictions — normal, and the usual cause of conflicting answers */}
      {site.jurisdictions && site.jurisdictions.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-forest-500 mb-2">
            Who governs this ground
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {site.jurisdictions.map((j) => (
              <li key={j.name} className="rounded-xl border border-forest-100 bg-forest-50/60 px-3 py-2">
                <p className="text-sm font-medium text-forest-900">
                  {j.url ? (
                    <a href={j.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {j.name} ↗
                    </a>
                  ) : (
                    j.name
                  )}
                </p>
                <p className="text-xs text-forest-600 mt-0.5">{j.role}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The rules themselves, grouped by activity */}
      <div className="space-y-5">
        {grouped.map(([activity, list]) => {
          const statuses = new Set(list.map((r) => r.status));
          const disputed = statuses.size > 1;
          return (
            <div key={activity}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-forest-900">{activity}</h3>
                {disputed && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    Sources disagree — read both
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {list.map((r, i) => {
                  const chip = statusChip(r.status);
                  return (
                    <li
                      key={`${r.authority}-${i}`}
                      className="rounded-xl border border-forest-100 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${chip.cls}`}>
                          {chip.label}
                        </span>
                        <span className="text-sm font-medium text-forest-900">{r.authority}</span>
                        {r.confidence && r.confidence !== "verified" && (
                          <span className="text-[11px] uppercase tracking-wide text-amber-800">
                            {r.confidence}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-forest-800 leading-relaxed">{r.detail}</p>
                      {r.conditions && (
                        <p className="mt-1 text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                          <strong>You need:</strong> {r.conditions}
                        </p>
                      )}
                      {r.caveat && (
                        <p className="mt-1 text-xs text-forest-700 bg-forest-50 border border-forest-100 rounded-lg px-3 py-1.5">
                          ⚠ {r.caveat}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-forest-500">
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-forest-700"
                        >
                          {r.sourceKind || "Source"} ↗
                        </a>
                        {r.sourceDate ? ` · dated ${r.sourceDate}` : " · date not shown on source"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* How to settle it for real */}
      {site.verifyWith && site.verifyWith.length > 0 && (
        <div className="mt-6 pt-5 border-t border-forest-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-forest-500 mb-2">
            Double-check before you go
          </h3>
          <p className="text-sm text-forest-600 mb-3">
            Rules change and pages go stale. One phone call beats any website — including this one.
          </p>
          <ul className="flex flex-col gap-2">
            {site.verifyWith.map((v) => (
              <li key={v.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className="font-medium text-forest-900">{v.label}</span>
                {v.phone && (
                  <a
                    href={`tel:${v.phone.replace(/[^+\d]/g, "")}`}
                    className="font-mono font-semibold text-forest-700 border-b-2 border-forest-300 hover:bg-forest-50"
                  >
                    {v.phone}
                  </a>
                )}
                {v.url && (
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest-600 underline underline-offset-2 hover:text-forest-800"
                  >
                    official page ↗
                  </a>
                )}
                {v.note && <span className="text-forest-600">{v.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasCaveat && (
        <p className="mt-5 text-xs text-forest-500 leading-relaxed">
          Immerse quotes official sources rather than paraphrasing them, and shows you when a
          source is stale or contradicts another. Where they conflict, we say so instead of
          picking the convenient answer.
        </p>
      )}
    </section>
  );
}
