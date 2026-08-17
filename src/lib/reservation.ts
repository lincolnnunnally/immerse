/**
 * Which official system actually holds your reservation? Labels must never say
 * "Recreation.gov" for a state park that books on its own site.
 */
export function reservationSystemName(url?: string | null): string {
  if (!url) return "the official site";
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "the official site";
  }
  if (host.endsWith("recreation.gov")) return "Recreation.gov";
  if (host.endsWith("alapark.com") || host.includes("alabamastateparks") || host.includes("reservealapark"))
    return "Alabama State Parks";
  if (host.endsWith("gastateparks.org") || host.includes("gastateparks")) return "Georgia State Parks";
  if (host.endsWith("reserveamerica.com")) return "ReserveAmerica";
  if (host.endsWith("tnstateparks.com")) return "Tennessee State Parks";
  if (host.endsWith("ncparks.gov")) return "NC State Parks";
  if (host.endsWith("southcarolinaparks.com")) return "SC State Parks";
  if (host.endsWith("floridastateparks.org") || host.includes("reserve.floridastateparks")) return "Florida State Parks";
  if (host.endsWith("nps.gov")) return "NPS.gov";
  if (host.endsWith("fs.usda.gov")) return "the Forest Service site";
  return host;
}

export function isRecreationGov(url?: string | null): boolean {
  return reservationSystemName(url) === "Recreation.gov";
}
