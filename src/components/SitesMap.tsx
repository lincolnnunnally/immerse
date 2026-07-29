"use client";

import { useEffect, useId, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { DEFAULT_MAP_CENTER, hasValidCoords, type MapPin } from "@/lib/maps";

type Props = {
  pins: MapPin[];
  /** Single-site focus: higher zoom, no list popups required */
  mode?: "search" | "site";
  className?: string;
  height?: string;
};

/**
 * Research map (OpenStreetMap tiles via Leaflet). No Mapbox key required.
 * Navigation is handled by DirectionsLinks → Apple / Google / Waze.
 */
export function SitesMap({
  pins,
  mode = "search",
  className = "",
  height = "h-80 md:h-96",
}: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const reactId = useId().replace(/:/g, "");

  const valid = pins.filter((p) => hasValidCoords(p.lat, p.lng));

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!mapEl.current || cancelled) return;
      const L = (await import("leaflet")).default;

      if (cancelled || !mapEl.current) return;

      // Default marker icons break under bundlers — use divIcon instead
      if (!mapRef.current) {
        mapRef.current = L.map(mapEl.current, {
          scrollWheelZoom: mode === "site",
          attributionControl: true,
        }).setView(
          [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
          DEFAULT_MAP_CENTER.zoom
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapRef.current);

        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const map = mapRef.current;
      const layer = layerRef.current;
      if (!map || !layer) return;

      layer.clearLayers();

      if (valid.length === 0) {
        map.setView([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng], 6);
        return;
      }

      const bounds: [number, number][] = [];

      valid.forEach((pin) => {
        const color =
          pin.type === "private"
            ? "#6d28d9"
            : pin.type === "dispersed" || pin.type === "wma"
              ? "#047857"
              : pin.type === "ohv"
                ? "#c2410c"
                : "#265c49";

        const icon = L.divIcon({
          className: "immerse-pin",
          html: `<div style="
            width:14px;height:14px;border-radius:9999px;
            background:${color};border:2px solid #fff;
            box-shadow:0 1px 4px rgba(0,0,0,.35);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([pin.lat, pin.lng], { icon });
        const popupHtml = pin.href
          ? `<strong style="font-size:13px">${escapeHtml(pin.name)}</strong><br/>
             <a href="${escapeAttr(pin.href)}" style="font-size:12px;color:#265c49">View site →</a>`
          : `<strong style="font-size:13px">${escapeHtml(pin.name)}</strong>`;
        marker.bindPopup(popupHtml, { maxWidth: 220 });
        marker.addTo(layer);
        bounds.push([pin.lat, pin.lng]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], mode === "site" ? 12 : 10);
      } else {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 11 });
      }

      // Leaflet sometimes mis-sizes in flex layouts
      setTimeout(() => map.invalidateSize(), 80);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [valid.map((p) => `${p.id}:${p.lat}:${p.lng}`).join("|"), mode]);

  // Full teardown on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-forest-100 shadow-sm ${className}`}>
      <div
        id={`immerse-map-${reactId}`}
        ref={mapEl}
        className={`w-full ${height} bg-forest-100 z-0`}
        role="img"
        aria-label={
          valid.length
            ? `Map with ${valid.length} camping location${valid.length === 1 ? "" : "s"}`
            : "Map (no plotted locations yet)"
        }
      />
      {valid.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-forest-600 bg-white/90 px-4 py-2 rounded-full border border-forest-100">
            No mappable coordinates in these results
          </p>
        </div>
      )}
      <p className="absolute bottom-2 left-2 text-[10px] text-forest-700 bg-white/85 px-2 py-0.5 rounded">
        Research map · not turn-by-turn nav
      </p>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
