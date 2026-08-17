import { getSiteWeather } from "@/lib/weather";
import { getParkAlerts } from "@/lib/nps";
import { formatLocalTime, sunTimes, todayYmd } from "@/lib/geo";
import type { CampSite } from "@/lib/types";

/**
 * "Trip-ready" panel — the things you check the night before you leave:
 * live NWS forecast + active weather alerts, park alerts/closures (NPS),
 * sunrise/sunset. Server component; every source is free and keyless.
 */
export async function TripReadyPanel({ site }: { site: CampSite }) {
  const [wx, park] = await Promise.all([
    getSiteWeather(site.lat, site.lng),
    site.npsParkCode ? getParkAlerts(site.npsParkCode) : Promise.resolve(null),
  ]);

  const tz = wx.timeZone || (site.lng < -85.6 ? "America/Chicago" : "America/New_York");
  const today = todayYmd(tz);
  const tomorrow = addDays(today, 1);
  const sunToday = sunTimes(site.lat, site.lng, today);
  const sunTomorrow = sunTimes(site.lat, site.lng, tomorrow);

  const periods = wx.periods.slice(0, 6);
  const updated = formatLocalTime(new Date(wx.fetchedAt), tz);

  return (
    <section className="mb-8 rounded-2xl border border-forest-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="font-semibold text-forest-900 text-lg">Trip-ready check</h2>
        <span className="text-xs text-forest-500">
          Live · National Weather Service{park ? " + National Park Service" : ""} · updated {updated}
        </span>
      </div>
      <p className="text-sm text-forest-600 mb-4">
        What to check the night before you leave — forecast, alerts, and daylight for{" "}
        {wx.city && wx.state ? `${wx.city}, ${wx.state}` : site.name}.
      </p>

      {/* Weather alerts */}
      {wx.alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {wx.alerts.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                /extreme|severe/i.test(a.severity)
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <p className="font-semibold">⚠ {a.event}</p>
              <p className="mt-0.5">{a.headline}</p>
              {a.instruction && <p className="mt-1 text-xs opacity-90">{a.instruction}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Park alerts */}
      {park && park.alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {park.alerts.slice(0, 5).map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                /closure|danger/i.test(a.category)
                  ? "bg-red-50 border-red-200 text-red-900"
                  : "bg-sky-50 border-sky-200 text-sky-900"
              }`}
            >
              <p className="font-semibold">
                {a.category === "Park Closure" ? "⛔" : "ℹ"} {a.title}
              </p>
              {a.description && <p className="mt-0.5 text-xs opacity-90">{a.description}</p>}
              {a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold underline">
                  Details ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      {park && park.alerts.length === 0 && !park.error && (
        <p className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
          ✓ No active park alerts or closures posted by the National Park Service.
        </p>
      )}

      {/* Forecast */}
      {periods.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {periods.map((p) => (
            <div
              key={p.startTime}
              className={`rounded-xl px-3 py-2.5 border ${
                p.isDaytime ? "bg-amber-50/60 border-amber-100" : "bg-forest-50 border-forest-100"
              }`}
            >
              <p className="text-xs font-semibold text-forest-800">{p.name}</p>
              <p className="text-2xl font-bold text-forest-900 leading-tight">
                {p.temperature}°<span className="text-sm font-medium">{p.temperatureUnit}</span>
              </p>
              <p className="text-xs text-forest-700 leading-snug">{p.shortForecast}</p>
              <p className="text-[11px] text-forest-500 mt-0.5">
                {p.precipChance != null && p.precipChance > 0 ? `${p.precipChance}% rain · ` : ""}
                {p.windSpeed ? `wind ${p.windSpeed}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 mb-4">
          {wx.error || "Forecast unavailable right now"} — check{" "}
          <a href={wx.forecastUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
            weather.gov
          </a>{" "}
          before you leave.
        </p>
      )}

      {/* Sun */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-forest-800">
        {sunToday && (
          <span>
            <span className="text-forest-500">Today:</span> ☀ {formatLocalTime(sunToday.sunrise, tz)} ·
            🌙 {formatLocalTime(sunToday.sunset, tz)}
          </span>
        )}
        {sunTomorrow && (
          <span>
            <span className="text-forest-500">Tomorrow:</span> ☀ {formatLocalTime(sunTomorrow.sunrise, tz)} ·
            🌙 {formatLocalTime(sunTomorrow.sunset, tz)}
          </span>
        )}
        <span className="text-xs text-forest-500 self-center">
          Set up camp before sunset — headlamp after.
        </span>
      </div>

      <p className="mt-4 text-xs text-forest-500">
        Forecast: {" "}
        <a href={wx.forecastUrl} target="_blank" rel="noopener noreferrer" className="underline">
          weather.gov point forecast
        </a>
        {park?.alertsUrl && (
          <>
            {" · "}Park alerts:{" "}
            <a href={park.alertsUrl} target="_blank" rel="noopener noreferrer" className="underline">
              nps.gov
            </a>
          </>
        )}
        . Conditions change — re-check the morning you leave.
      </p>
    </section>
  );
}

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
