/**
 * National Weather Service (api.weather.gov) — free, no key, US only.
 * Requires a User-Agent. Cached at the edge for 30 minutes.
 * Docs: https://www.weather.gov/documentation/services-web-api
 */

const UA = "ImmerseCampPlanner/1.0 (nature immersion; hello@unitedundergod.org)";

export type ForecastPeriod = {
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  precipChance: number | null;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  icon?: string;
};

export type WeatherAlert = {
  id: string;
  event: string;
  headline: string;
  severity: string;
  urgency?: string;
  description?: string;
  instruction?: string;
  ends?: string | null;
  expires?: string | null;
};

export type SiteWeather = {
  office?: string;
  timeZone?: string;
  city?: string;
  state?: string;
  periods: ForecastPeriod[];
  alerts: WeatherAlert[];
  forecastUrl?: string;
  fetchedAt: string;
  error?: string;
};

async function nws<T>(url: string, revalidate = 1800): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/geo+json, application/json", "user-agent": UA },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`NWS ${res.status}`);
  return res.json() as Promise<T>;
}

/** Full point forecast + active alerts. Never throws — returns error string instead. */
export async function getSiteWeather(lat: number, lng: number): Promise<SiteWeather> {
  const fetchedAt = new Date().toISOString();
  const la = Number(lat.toFixed(4));
  const ln = Number(lng.toFixed(4));
  try {
    const point = await nws<{
      properties?: {
        forecast?: string;
        forecastHourly?: string;
        timeZone?: string;
        cwa?: string;
        relativeLocation?: { properties?: { city?: string; state?: string } };
      };
    }>(`https://api.weather.gov/points/${la},${ln}`, 86400);

    const p = point.properties || {};
    const [forecastRes, alertsRes] = await Promise.allSettled([
      p.forecast ? nws<{ properties?: { periods?: RawPeriod[] } }>(p.forecast, 1800) : Promise.reject(new Error("no forecast url")),
      nws<{ features?: RawAlert[] }>(`https://api.weather.gov/alerts/active?point=${la},${ln}`, 600),
    ]);

    const periods: ForecastPeriod[] =
      forecastRes.status === "fulfilled"
        ? (forecastRes.value.properties?.periods || []).map(mapPeriod)
        : [];

    const alerts: WeatherAlert[] =
      alertsRes.status === "fulfilled"
        ? (alertsRes.value.features || []).map(mapAlert)
        : [];

    return {
      office: p.cwa,
      timeZone: p.timeZone,
      city: p.relativeLocation?.properties?.city,
      state: p.relativeLocation?.properties?.state,
      periods,
      alerts,
      forecastUrl: `https://forecast.weather.gov/MapClick.php?lat=${la}&lon=${ln}`,
      fetchedAt,
      error: forecastRes.status === "rejected" ? "Forecast temporarily unavailable" : undefined,
    };
  } catch (e) {
    return {
      periods: [],
      alerts: [],
      forecastUrl: `https://forecast.weather.gov/MapClick.php?lat=${la}&lon=${ln}`,
      fetchedAt,
      error: e instanceof Error ? e.message : "Weather unavailable",
    };
  }
}

type RawPeriod = {
  name?: string;
  startTime?: string;
  endTime?: string;
  isDaytime?: boolean;
  temperature?: number;
  temperatureUnit?: string;
  probabilityOfPrecipitation?: { value?: number | null };
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
  detailedForecast?: string;
  icon?: string;
};

function mapPeriod(r: RawPeriod): ForecastPeriod {
  return {
    name: r.name || "",
    startTime: r.startTime || "",
    endTime: r.endTime || "",
    isDaytime: r.isDaytime !== false,
    temperature: Number(r.temperature ?? 0),
    temperatureUnit: r.temperatureUnit || "F",
    precipChance:
      r.probabilityOfPrecipitation?.value == null
        ? null
        : Number(r.probabilityOfPrecipitation.value),
    windSpeed: r.windSpeed || "",
    windDirection: r.windDirection || "",
    shortForecast: r.shortForecast || "",
    detailedForecast: r.detailedForecast || "",
    icon: r.icon,
  };
}

type RawAlert = {
  id?: string;
  properties?: {
    id?: string;
    event?: string;
    headline?: string;
    severity?: string;
    urgency?: string;
    description?: string;
    instruction?: string;
    ends?: string | null;
    expires?: string | null;
  };
};

function mapAlert(r: RawAlert): WeatherAlert {
  const p = r.properties || {};
  return {
    id: p.id || r.id || Math.random().toString(36).slice(2),
    event: p.event || "Weather alert",
    headline: p.headline || p.event || "",
    severity: p.severity || "Unknown",
    urgency: p.urgency,
    description: p.description,
    instruction: p.instruction,
    ends: p.ends,
    expires: p.expires,
  };
}
