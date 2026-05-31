import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import DashboardEmptyState from "./DashboardEmptyState";
import DashboardSection from "./DashboardSection";

const riskLegends = [
  ["bg-red-600", "Tinggi"],
  ["bg-yellow-400", "Sedang"],
  ["bg-green-600", "Rendah"],
];

const normalizeName = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/kecamatan/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const getFeatureName = (feature) => {
  const properties = feature?.properties || {};

  return (
    properties.name ||
    properties.NAME ||
    properties.NAMOBJ ||
    properties.NAMOBJ_Kec ||
    properties.kecamatan ||
    properties.KECAMATAN ||
    properties.WADMKC ||
    properties.wadmkc ||
    ""
  );
};

const getRegionName = (region) => {
  return region?.name || region?.region_name || region?.nama_kecamatan || "";
};

const getRiskStatus = (region) => {
  return (
    region?.risk_status ||
    region?.dominant_risk_status ||
    region?.final_label ||
    region?.predicted_label ||
    "Sedang"
  );
};

const getRiskColor = (riskStatus) => {
  if (riskStatus === "Tinggi") return "#dc2626";
  if (riskStatus === "Sedang") return "#facc15";
  return "#16a34a";
};

const getDefaultStyle = () => ({
  color: "#0f766e",
  weight: 1.2,
  opacity: 0.72,
  fillColor: "#5eead4",
  fillOpacity: 0.18,
});

const getFeatureStyle = (region) => {
  if (!region) {
    return getDefaultStyle();
  }

  const riskStatus = getRiskStatus(region);
  const color = getRiskColor(riskStatus);

  return {
    color: "#0f172a",
    weight: 1.3,
    opacity: 0.5,
    fillColor: color,
    fillOpacity:
      riskStatus === "Tinggi" ? 0.55 : riskStatus === "Sedang" ? 0.46 : 0.4,
  };
};

function FitBounds({ geoJson }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJson) return;

    const layer = window.L?.geoJSON?.(geoJson);

    if (!layer) return;

    const bounds = layer.getBounds();

    if (bounds?.isValid?.()) {
      map.fitBounds(bounds, {
        padding: [18, 18],
        animate: false,
      });
    }
  }, [geoJson, map]);

  return null;
}

export default function DashboardChoroplethPanel({
  badge = "Peta",
  title = "Peta Prioritas",
  description = "Visual wilayah berdasarkan tingkat risiko.",
  topRegions = [],
}) {
  const [geoJson, setGeoJson] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const regionLookup = useMemo(() => {
    const lookup = new Map();

    topRegions.forEach((region) => {
      lookup.set(normalizeName(getRegionName(region)), region);
    });

    return lookup;
  }, [topRegions]);

  useEffect(() => {
    const controller = new AbortController();

    const loadGeoJson = async () => {
      setErrorMessage("");

      try {
        const baseUrl = import.meta.env.BASE_URL || "/";
        const response = await fetch(
          `${baseUrl}geojson/bandung-kecamatan.geojson`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("GeoJSON wilayah tidak ditemukan.");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setGeoJson(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(error.message || "GeoJSON gagal dimuat.");
        }
      }
    };

    loadGeoJson();

    return () => controller.abort();
  }, []);

  const onEachFeature = (feature, layer) => {
    const featureName = getFeatureName(feature);
    const matchedRegion = regionLookup.get(normalizeName(featureName));
    const riskStatus = getRiskStatus(matchedRegion);
    const vulnerable = matchedRegion?.total_vulnerable_population || "-";
    const pipGap = matchedRegion?.pip_gap || "-";

    layer.bindTooltip(featureName || "Wilayah", {
      sticky: true,
      direction: "top",
      className: "pintarin-map-tooltip",
    });

    layer.bindPopup(`
      <div style="min-width: 180px">
        <p style="margin:0 0 6px;font-weight:800;color:#102A43">${featureName || "Wilayah"}</p>
        <p style="margin:0;color:#64748B;font-size:12px">Risiko: <b>${matchedRegion ? riskStatus : "Belum ada data"}</b></p>
        <p style="margin:4px 0 0;color:#64748B;font-size:12px">Warga rentan: <b>${vulnerable}</b></p>
        <p style="margin:4px 0 0;color:#64748B;font-size:12px">Gap PIP: <b>${pipGap}</b></p>
      </div>
    `);

    layer.on({
      mouseover: (event) => {
        event.target.setStyle({
          weight: 2.4,
          opacity: 0.9,
          fillOpacity: matchedRegion ? 0.68 : 0.28,
        });
        event.target.bringToFront();
      },
      mouseout: (event) => {
        event.target.setStyle(getFeatureStyle(matchedRegion));
      },
    });
  };

  return (
    <DashboardSection
      badge={badge}
      title={title}
      description={description}
      action={
        <div className="flex flex-wrap gap-3 text-xs font-extrabold text-[#64748B]">
          {riskLegends.map(([colorClass, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${colorClass}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      }
    >
      {errorMessage ? (
        <DashboardEmptyState
          title="Peta belum bisa dimuat."
          description={errorMessage}
        />
      ) : !geoJson ? (
        <DashboardEmptyState
          title="Menyiapkan peta."
          description="GeoJSON wilayah sedang dimuat."
        />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/38 p-3 ring-1 ring-white/40 backdrop-blur-xl">
          <div className="h-[420px] overflow-hidden rounded-[1.25rem]">
            <MapContainer
              center={[-6.9175, 107.6191]}
              zoom={11}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <GeoJSON
                key={`${topRegions.length}-${JSON.stringify(topRegions.map((item) => item.region_name || item.name))}`}
                data={geoJson}
                style={(feature) => {
                  const featureName = getFeatureName(feature);
                  const matchedRegion = regionLookup.get(
                    normalizeName(featureName),
                  );

                  return getFeatureStyle(matchedRegion);
                }}
                onEachFeature={onEachFeature}
              />

              <FitBounds geoJson={geoJson} />
            </MapContainer>
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
