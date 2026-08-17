/**
 * National Park Service API — alerts/closures for a park unit.
 * https://www.nps.gov/subjects/developer/api-documentation.htm
 * Uses NPS_API_KEY when set; falls back to DEMO_KEY (rate-limited: fine with
 * a 15-minute edge cache for a handful of parks).
 */

export type ParkAlert = {
  id: string;
  title: string;
  category: string; // "Park Closure" | "Danger" | "Caution" | "Information"
  description?: string;
  url?: string;
  lastIndexedDate?: string;
};

export type ParkAlerts = {
  parkCode: string;
  alerts: ParkAlert[];
  alertsUrl: string;
  fetchedAt: string;
  error?: string;
};

export async function getParkAlerts(parkCode: string): Promise<ParkAlerts> {
  const code = parkCode.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8);
  const alertsUrl = `https://www.nps.gov/${code}/planyourvisit/alerts.htm`;
  const fetchedAt = new Date().toISOString();
  const key = process.env.NPS_API_KEY || "DEMO_KEY";
  try {
    const res = await fetch(
      `https://developer.nps.gov/api/v1/alerts?parkCode=${code}&limit=20&api_key=${encodeURIComponent(key)}`,
      {
        headers: { accept: "application/json", "user-agent": "ImmerseCampPlanner/1.0 (hello@unitedundergod.org)" },
        next: { revalidate: 900 },
      }
    );
    if (!res.ok) throw new Error(`NPS ${res.status}`);
    const json = (await res.json()) as {
      data?: Array<{
        id?: string;
        title?: string;
        category?: string;
        description?: string;
        url?: string;
        lastIndexedDate?: string;
      }>;
    };
    const alerts: ParkAlert[] = (json.data || []).map((a, i) => ({
      id: a.id || `alert-${i}`,
      title: a.title || "Park alert",
      category: a.category || "Information",
      description: a.description?.trim() || undefined,
      url: a.url || undefined,
      lastIndexedDate: a.lastIndexedDate,
    }));
    // Closures and dangers first
    const rank = (c: string) =>
      /closure/i.test(c) ? 0 : /danger/i.test(c) ? 1 : /caution/i.test(c) ? 2 : 3;
    alerts.sort((a, b) => rank(a.category) - rank(b.category));
    return { parkCode: code, alerts, alertsUrl, fetchedAt };
  } catch (e) {
    return {
      parkCode: code,
      alerts: [],
      alertsUrl,
      fetchedAt,
      error: e instanceof Error ? e.message : "NPS alerts unavailable",
    };
  }
}
