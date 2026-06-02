import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

import { formatNumber, formatPercent } from "../../lib/utils";
import {
  buildRegionLookup,
  getAiRiskStatus,
  getFeatureDistrictName,
  getRegionFromFeature,
  getRegionMetrics,
  getRegionName,
  getRiskTheme,
} from "./riskMapUtils";

const formatOptionalNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? formatNumber(number) : "-";
};

const formatOptionalPercent = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? formatPercent(number) : "-";
};

const getFeatureStyle = (feature, regionLookup, isActive = false) => {
  const region = getRegionFromFeature(feature, regionLookup);
  const riskStatus = getAiRiskStatus(region);
  const theme = getRiskTheme(riskStatus);

  if (!region) {
    return {
      fillColor: "#94a3b8",
      color: "#475569",
      weight: isActive ? 2.5 : 1.3,
      opacity: 0.8,
      fillOpacity: isActive ? 0.42 : 0.2,
    };
  }

  return {
    fillColor: theme.fillColor,
    color: theme.borderColor,
    weight: isActive ? 3 : 1.7,
    opacity: 1,
    fillOpacity: isActive ? 0.9 : 0.76,
  };
};

const getFilteredGeoJson = (geoJson, regions = []) => {
  if (!geoJson?.features?.length) return null;

  const regionLookup = buildRegionLookup(regions);
  const filteredFeatures = geoJson.features.filter((feature) =>
    Boolean(getRegionFromFeature(feature, regionLookup)),
  );

  return {
    ...geoJson,
    features: filteredFeatures.length > 0 ? filteredFeatures : geoJson.features,
  };
};

function MapAutoFocus({ geoJson }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJson?.features?.length) return;

    const layer = L.geoJSON(geoJson);
    const bounds = layer.getBounds();

    if (!bounds.isValid()) return;

    const paddedBounds = bounds.pad(0.035);

    map.fitBounds(paddedBounds, {
      padding: [18, 18],
      animate: false,
    });

    map.setMaxBounds(paddedBounds.pad(0.18));
  }, [geoJson, map]);

  return null;
}

function RegionDetailPanel({ selectedRegion }) {
  if (!selectedRegion) {
    return (
      <div className="flex h-full min-h-[14rem] items-center justify-center rounded-[1.5rem] border border-white/70 bg-white/42 p-5 text-center ring-1 ring-white/40 backdrop-blur-2xl">
        <p className="max-w-xs text-sm font-medium leading-6 text-[#64748B]">
          Klik wilayah pada peta untuk melihat data prioritas.
        </p>
      </div>
    );
  }

  const { name, region, riskStatus } = selectedRegion;
  const theme = getRiskTheme(riskStatus);
  const metrics = getRegionMetrics(region);

  const detailItems = [
    ["Prioritas AI", theme.shortLabel],
    ["Warga rentan", formatOptionalNumber(metrics.vulnerablePopulation)],
    ["Rasio rentan", formatOptionalPercent(metrics.vulnerableRatio)],
    ["Gap PIP", formatOptionalNumber(metrics.pipGap)],
    ["Sekolah", formatOptionalNumber(metrics.schools)],
    ["Skor prioritas", formatOptionalNumber(metrics.priorityScore)],
  ];

  return (
    <aside className="rounded-[1.5rem] border border-white/70 bg-white/50 p-5 shadow-xl shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase text-[#64748B]">
            Detail Wilayah
          </p>
          <h3 className="mt-2 text-xl font-extrabold leading-tight text-[#102A43]">
            {name}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold ${theme.badgeClass}`}
        >
          {theme.shortLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {detailItems.map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.1rem] bg-white/42 p-3 shadow-inner shadow-white/40"
          >
            <p className="text-xs font-bold text-[#64748B]">{label}</p>
            <p className="mt-1 text-sm font-extrabold text-[#102A43]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs font-medium leading-5 text-[#64748B]">
        Warna peta memakai rekomendasi AI terbaru. Keputusan akhir tetap melalui
        validasi manusia.
      </p>
    </aside>
  );
}

export default function RiskChoroplethMap({
  geoJson,
  regions = [],
  heightClassName = "h-[340px] sm:h-[430px] lg:h-[500px]",
  showDetailPanel = true,
}) {
  const activeRegionLayerRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const regionLookup = useMemo(() => buildRegionLookup(regions), [regions]);

  const filteredGeoJson = useMemo(
    () => getFilteredGeoJson(geoJson, regions),
    [geoJson, regions],
  );

  const onEachFeature = (feature, layer) => {
    const districtName = getFeatureDistrictName(feature) || "Wilayah";
    const region = getRegionFromFeature(feature, regionLookup);
    const displayName = getRegionName(region) || districtName;
    const riskStatus = getAiRiskStatus(region);

    layer.feature = feature;

    layer.on({
      mouseover: () => {
        layer.setStyle(getFeatureStyle(feature, regionLookup, true));
        layer.bringToFront();
      },
      mouseout: () => {
        if (activeRegionLayerRef.current !== layer) {
          layer.setStyle(getFeatureStyle(feature, regionLookup, false));
        }
      },
      click: (event) => {
        if (
          activeRegionLayerRef.current &&
          activeRegionLayerRef.current !== layer
        ) {
          activeRegionLayerRef.current.setStyle(
            getFeatureStyle(
              activeRegionLayerRef.current.feature,
              regionLookup,
              false,
            ),
          );
        }

        activeRegionLayerRef.current = layer;

        const map = layer._map || event.target?._map;
        const bounds = layer.getBounds?.();

        setSelectedRegion({
          name: displayName,
          region,
          riskStatus,
        });

        layer.setStyle(getFeatureStyle(feature, regionLookup, true));
        layer.bringToFront();

        if (map) {
          if (bounds?.isValid?.()) {
            map.flyToBounds(bounds.pad(0.08), {
              animate: true,
              duration: 0.58,
              easeLinearity: 0.22,
              padding: [24, 24],
              maxZoom: 13,
            });
          } else {
            map.flyTo(event.latlng, Math.max(map.getZoom(), 12), {
              animate: true,
              duration: 0.45,
              easeLinearity: 0.22,
            });
          }
        }
      },
    });
  };

  const mapElement = (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/34 shadow-xl shadow-slate-200/25 ring-1 ring-white/40 backdrop-blur-2xl ${heightClassName}`}
    >
      <MapContainer
        center={[-6.9175, 107.6191]}
        zoom={12}
        minZoom={10}
        maxZoom={16}
        keyboard={false}
        scrollWheelZoom={false}
        maxBoundsViscosity={1}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoFocus geoJson={filteredGeoJson} />

        {filteredGeoJson && (
          <GeoJSON
            key={JSON.stringify(
              regions.map((region) => [
                region.region_code,
                getRegionName(region),
                getAiRiskStatus(region),
              ]),
            )}
            data={filteredGeoJson}
            style={(feature) => getFeatureStyle(feature, regionLookup)}
            onEachFeature={onEachFeature}
          />
        )}

      </MapContainer>
    </div>
  );

  if (!showDetailPanel) {
    return mapElement;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      {mapElement}
      <RegionDetailPanel selectedRegion={selectedRegion} />
    </div>
  );
}
