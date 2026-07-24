import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteById } from "@/lib/mock-sites";
import { extractFacilityId } from "@/lib/trips";
import { AvailabilityPanel } from "@/components/AvailabilityPanel";
import { SaveTripButton } from "@/components/SaveTripButton";

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = getSiteById(id);
  if (!site) notFound();

  const facilityId = extractFacilityId(site.reservationUrl, site.id);

  const typeLabel =
    site.type === "dispersed"
      ? "Dispersed / Free"
      : site.type === "wma"
      ? "WMA / Wildlife Area"
      : site.type === "ohv"
      ? "OHV / 4x4"
      : "Developed Campground";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/search"
        className="inline-flex items-center text-sm text-forest-600 hover:text-forest-800 mb-6"
      >
        ← Back to search
      </Link>

      <div className="mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-forest-500">
          {typeLabel}
        </span>
      </div>
      <h1 className="text-3xl font-bold text-forest-900 mb-1">{site.name}</h1>
      {site.agency && <p className="text-forest-600 mb-4">{site.agency}</p>}

      <div className="flex flex-wrap gap-3 mb-8">
        <SaveTripButton site={site} />
        {site.reservationUrl && (
          <a
            href={site.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-forest-700 text-white text-sm font-semibold hover:bg-forest-800 transition"
          >
            Open Recreation.gov →
          </a>
        )}
      </div>

      <p className="text-lg text-forest-800 leading-relaxed mb-8">{site.description}</p>

      {/* Clarity grid */}
      <section className="bg-white rounded-2xl border border-forest-100 p-6 mb-8 shadow-sm">
        <h2 className="font-semibold text-forest-900 mb-4 text-lg">Everything you need to know</h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <div>
            <dt className="text-forest-500 mb-0.5">Drive time (from metro Atlanta / Conyers)</dt>
            <dd className="font-medium text-forest-900 text-base">
              {site.driveTimeMinutes
                ? `~${Math.floor(site.driveTimeMinutes / 60)}h ${site.driveTimeMinutes % 60}m`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-forest-500 mb-0.5">Hike-in</dt>
            <dd className="font-medium text-forest-900 text-base">
              {site.hikeInMiles === 0 || site.hikeInMiles == null
                ? "Drive-up / no significant hike"
                : `${site.hikeInMiles} miles`}
              {site.hikeInElevationGain ? ` · +${site.hikeInElevationGain} ft` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-forest-500 mb-0.5">Pass required</dt>
            <dd className="font-medium text-forest-900">{site.passRequired}</dd>
          </div>
          <div>
            <dt className="text-forest-500 mb-0.5">Parking</dt>
            <dd className="font-medium text-forest-900">{site.parkingFee || "See notes"}</dd>
          </div>
          <div>
            <dt className="text-forest-500 mb-0.5">Camping fee</dt>
            <dd className="font-medium text-forest-900">{site.campingFee || "Free / check site"}</dd>
          </div>
          <div>
            <dt className="text-forest-500 mb-0.5">Max stay</dt>
            <dd className="font-medium text-forest-900">
              {site.maxStayDays ? `${site.maxStayDays} days` : "Check local rules"}
            </dd>
          </div>
          <div>
            <dt className="text-forest-500 mb-0.5">Reservation</dt>
            <dd className="font-medium text-forest-900">
              {site.reservationRequired ? (
                <>
                  Required
                  {site.bookingWindow && (
                    <span className="block text-forest-600 font-normal text-xs mt-0.5">
                      Window: {site.bookingWindow}
                    </span>
                  )}
                </>
              ) : (
                "Not required — first-come, first-served"
              )}
            </dd>
          </div>
          {site.elevation && (
            <div>
              <dt className="text-forest-500 mb-0.5">Elevation</dt>
              <dd className="font-medium text-forest-900">{site.elevation.toLocaleString()} ft</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Live availability */}
      <AvailabilityPanel facilityId={facilityId} reservationUrl={site.reservationUrl} />

      {/* Must-sees */}
      <section className="mb-8">
        <h2 className="font-semibold text-forest-900 mb-3 text-lg">Must-sees & highlights</h2>
        <ul className="space-y-2">
          {site.mustSees.map((item) => (
            <li key={item} className="flex items-start gap-2 text-forest-800">
              <span className="text-forest-500 mt-0.5">▸</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {site.amenities.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-forest-900 mb-3 text-lg">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {site.amenities.map((a) => (
              <span
                key={a}
                className="text-sm bg-forest-50 text-forest-700 px-3 py-1 rounded-full"
              >
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      {site.notes && (
        <section className="mb-10 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900">
          <strong>Note:</strong> {site.notes}
        </section>
      )}

      {/* Sample itinerary */}
      <section className="bg-forest-50 rounded-2xl p-6 border border-forest-100">
        <h2 className="font-semibold text-forest-900 mb-1 text-lg">Sample 2-night immersion plan</h2>
        <p className="text-sm text-forest-600 mb-5">
          Adjust dates once you lock the reservation. This is a starting template.
        </p>

        <div className="space-y-5">
          <div>
            <h3 className="font-medium text-forest-800 mb-1">Day 0 — Departure</h3>
            <ul className="text-sm text-forest-700 space-y-1 ml-4 list-disc">
              <li>
                Leave with buffer for the ~
                {site.driveTimeMinutes
                  ? `${Math.floor(site.driveTimeMinutes / 60)}h ${site.driveTimeMinutes % 60}m`
                  : "drive"}{" "}
                + grocery / ice stop
              </li>
              <li>Arrive, set up camp, short walk to orient</li>
              <li>Simple dinner + early night if traveling after work</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-forest-800 mb-1">Day 1 — Main immersion</h3>
            <ul className="text-sm text-forest-700 space-y-1 ml-4 list-disc">
              {site.mustSees.slice(0, 2).map((m) => (
                <li key={m}>Explore: {m}</li>
              ))}
              <li>Longer hike or creek time in the afternoon</li>
              <li>Campfire, quiet evening</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-forest-800 mb-1">Day 2 — Morning + departure</h3>
            <ul className="text-sm text-forest-700 space-y-1 ml-4 list-disc">
              <li>Slow morning, coffee, short walk</li>
              <li>Pack out (Leave No Trace)</li>
              <li>Optional stop on the way home</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
