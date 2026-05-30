import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";

const riskThemes = {
  Tinggi: {
    fillColor: "#dc2626",
    borderColor: "#7f1d1d",
    label: "Risiko Tinggi",
  },
  Sedang: {
    fillColor: "#facc15",
    borderColor: "#a16207",
    label: "Risiko Sedang",
  },
  Rendah: {
    fillColor: "#16a34a",
    borderColor: "#14532d",
    label: "Risiko Rendah",
  },
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatNumber = (value) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number === 0) return "-";
  return number.toLocaleString("id-ID");
};

const formatPercent = (value) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number === 0) return "-";
  return `${number.toFixed(1)}%`;
};

const getFeatureDistrictName = (feature) => {
  const properties = feature?.properties || {};

  return (
    properties.name ||
    properties.nama ||
    properties.NAMOBJ ||
    properties.WADMKC ||
    properties.kecamatan ||
    properties.KECAMATAN ||
    properties.nama_kecamatan ||
    properties.NAMA_KEC ||
    properties.NAMKEC ||
    ""
  );
};

const getFeatureDistrictCode = (feature) => {
  const properties = feature?.properties || {};

  return (
    properties.region_code ||
    properties.kode ||
    properties.KODE ||
    properties.KDCPUM ||
    properties.KDPPUM ||
    ""
  );
};

const buildRegionLookup = (regions = []) => {
  const lookup = new Map();

  regions.forEach((region) => {
    const name = normalizeText(region.name || region.region_name);
    const code = normalizeText(region.region_code);

    if (name) lookup.set(name, region);
    if (code) lookup.set(code, region);
  });

  return lookup;
};

const getRegionFromFeature = (feature, regionLookup) => {
  const districtName = normalizeText(getFeatureDistrictName(feature));
  const districtCode = normalizeText(getFeatureDistrictCode(feature));

  return regionLookup.get(districtName) || regionLookup.get(districtCode) || null;
};

const getRiskStatus = (feature, regionLookup) => {
  const apiRegion = getRegionFromFeature(feature, regionLookup);

  return (
    apiRegion?.risk_status ||
    apiRegion?.dominant_risk_status ||
    apiRegion?.final_label ||
    feature?.properties?.risk_status ||
    "Sedang"
  );
};

const getRiskTheme = (riskStatus) => riskThemes[riskStatus] || riskThemes.Sedang;

const getFeatureStyle = (feature, regionLookup, isActive = false) => {
  const theme = getRiskTheme(getRiskStatus(feature, regionLookup));

  return {
    fillColor: theme.fillColor,
    color: theme.borderColor,
    weight: isActive ? 3 : 1.7,
    opacity: 1,
    fillOpacity: isActive ? 0.88 : 0.72,
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

const getRegionMetrics = (apiRegion) => ({
  vulnerablePopulation:
    apiRegion?.total_vulnerable_population ||
    apiRegion?.avg_vulnerable_population ||
    apiRegion?.vulnerable_population ||
    0,
  vulnerableRatio:
    apiRegion?.avg_vulnerable_ratio || apiRegion?.vulnerable_ratio || 0,
  pipGap: apiRegion?.pip_gap || apiRegion?.avg_pip_gap || 0,
  schools: apiRegion?.total_schools || apiRegion?.school_count || 0,
});

const renderTooltipContent = ({ name, riskStatus }) => {
  const theme = getRiskTheme(riskStatus);

  return `
    <div class="pintarin-tooltip">
      <span class="pintarin-tooltip__dot" style="background:${theme.fillColor}"></span>
      <span>${escapeHtml(name)}</span>
      <strong>${escapeHtml(theme.label)}</strong>
    </div>
  `;
};

const renderPopupContent = ({ name, riskStatus, apiRegion }) => {
  const theme = getRiskTheme(riskStatus);
  const metrics = getRegionMetrics(apiRegion);

  return `
    <div class="pintarin-popup">
      <div class="pintarin-popup__header">
        <div>
          <p class="pintarin-popup__eyebrow">Kecamatan</p>
          <h3>${escapeHtml(name)}</h3>
        </div>
        <span
          class="pintarin-popup__badge"
          style="background:${theme.fillColor}22;color:${theme.borderColor};border-color:${theme.fillColor}55;"
        >
          ${escapeHtml(theme.label)}
        </span>
      </div>

      <div class="pintarin-popup__grid">
        <div class="pintarin-popup__metric">
          <span>Warga rentan</span>
          <strong>${formatNumber(metrics.vulnerablePopulation)}</strong>
        </div>
        <div class="pintarin-popup__metric">
          <span>Rasio rentan</span>
          <strong>${formatPercent(metrics.vulnerableRatio)}</strong>
        </div>
        <div class="pintarin-popup__metric">
          <span>Gap PIP</span>
          <strong>${formatNumber(metrics.pipGap)}</strong>
        </div>
        <div class="pintarin-popup__metric">
          <span>Sekolah</span>
          <strong>${formatNumber(metrics.schools)}</strong>
        </div>
      </div>

      <p class="pintarin-popup__note">
        Warna wilayah mengikuti status risiko terbaru dari database PINTARIN.
      </p>
    </div>
  `;
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
    map.setMinZoom(Math.max(11, map.getZoom()));
  }, [geoJson, map]);

  return null;
}

export default function PriorityChoroplethMap({ geoJson, regions = [] }) {
  const activeTooltipLayerRef = useRef(null);
  const activeRegionLayerRef = useRef(null);

  const regionLookup = useMemo(() => buildRegionLookup(regions), [regions]);

  const filteredGeoJson = useMemo(
    () => getFilteredGeoJson(geoJson, regions),
    [geoJson, regions],
  );

  const onEachFeature = (feature, layer) => {
    const districtName = getFeatureDistrictName(feature) || "Wilayah";
    const apiRegion = getRegionFromFeature(feature, regionLookup);
    const riskStatus = getRiskStatus(feature, regionLookup);

    layer.bindTooltip(renderTooltipContent({ name: districtName, riskStatus }), {
      sticky: true,
      direction: "top",
      opacity: 1,
      permanent: false,
      className: "pintarin-map-tooltip",
    });

    layer.bindPopup(
      renderPopupContent({ name: districtName, riskStatus, apiRegion }),
      {
        autoClose: true,
        closeOnClick: true,
        closeButton: true,
        autoPan: true,
        keepInView: true,
        autoPanPaddingTopLeft: [32, 84],
        autoPanPaddingBottomRight: [32, 32],
        maxWidth: 340,
        minWidth: 260,
        maxHeight: 280,
        offset: [0, -8],
        className: "pintarin-map-popup",
      },
    );

    layer.on({
      mouseover: (event) => {
        if (
          activeTooltipLayerRef.current &&
          activeTooltipLayerRef.current !== layer
        ) {
          activeTooltipLayerRef.current.closeTooltip();
        }

        activeTooltipLayerRef.current = layer;
        layer.setStyle(getFeatureStyle(feature, regionLookup, true));
        layer.openTooltip(event.latlng);
        layer.bringToFront();
      },
      mousemove: (event) => {
        layer.openTooltip(event.latlng);
      },
      mouseout: () => {
        if (activeTooltipLayerRef.current === layer) {
          activeTooltipLayerRef.current = null;
        }

        layer.closeTooltip();

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

        activeTooltipLayerRef.current?.closeTooltip();
        activeRegionLayerRef.current = layer;

        const map = event.target._map;
        const bounds = layer.getBounds?.();
        const popupLatLng = bounds?.isValid?.()
          ? bounds.getCenter()
          : event.latlng;

        layer.setStyle(getFeatureStyle(feature, regionLookup, true));

        if (map) {
          map.panTo(popupLatLng, { animate: true, duration: 0.35 });
        }

        layer.openPopup(popupLatLng);
      },
      popupclose: () => {
        if (activeRegionLayerRef.current === layer) {
          activeRegionLayerRef.current = null;
          layer.setStyle(getFeatureStyle(feature, regionLookup, false));
        }
      },
    });
  };

  return (
    <div className="relative h-[340px] overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/28 shadow-xl shadow-slate-300/20 ring-1 ring-white/40 backdrop-blur-2xl sm:h-[430px] sm:rounded-[2rem] lg:h-[500px]">
      <style>
        {`
          .leaflet-container {
            font-family: "Plus Jakarta Sans", system-ui, sans-serif;
          }

          .pintarin-map-tooltip {
            border: 0;
            background: transparent;
            box-shadow: none;
          }

          .pintarin-map-tooltip::before {
            display: none;
          }

          .pintarin-tooltip {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border: 1px solid rgba(255,255,255,0.72);
            border-radius: 999px;
            background: rgba(255,255,255,0.84);
            color: #102A43;
            font: 700 12px/1.2 "Plus Jakarta Sans", system-ui, sans-serif;
            box-shadow: 0 14px 32px rgba(15,23,42,0.12);
            backdrop-filter: blur(16px);
          }

          .pintarin-tooltip strong {
            color: #64748B;
            font-weight: 800;
          }

          .pintarin-tooltip__dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            flex: 0 0 auto;
          }

          .pintarin-map-popup .leaflet-popup-content-wrapper {
            max-height: 280px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.72);
            border-radius: 24px;
            background: rgba(255,255,255,0.90);
            box-shadow: 0 24px 70px rgba(15,23,42,0.18);
            backdrop-filter: blur(18px);
          }

          .pintarin-map-popup .leaflet-popup-content {
            margin: 0;
            width: auto !important;
            max-height: 280px;
            overflow-y: auto;
            scrollbar-width: thin;
          }

          .pintarin-map-popup .leaflet-popup-tip {
            background: rgba(255,255,255,0.90);
          }

          .pintarin-map-popup .leaflet-popup-close-button {
            top: 10px;
            right: 10px;
            width: 28px;
            height: 28px;
            border-radius: 999px;
            color: #475569;
            background: rgba(255, 255, 255, 0.72);
            font-size: 18px;
            line-height: 28px;
          }

          .pintarin-map-popup .leaflet-popup-close-button:hover {
            color: #0f766e;
            background: rgba(204, 251, 241, 0.75);
          }

          .pintarin-popup {
            padding: 16px;
            color: #102A43;
            font-family: "Plus Jakarta Sans", system-ui, sans-serif;
          }

          .pintarin-popup__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding-right: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(148,163,184,0.22);
          }

          .pintarin-popup__eyebrow {
            margin: 0 0 4px;
            color: #64748B;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .pintarin-popup h3 {
            margin: 0;
            color: #102A43;
            font-size: 18px;
            line-height: 1.15;
            font-weight: 900;
            letter-spacing: -0.03em;
          }

          .pintarin-popup__badge {
            flex: 0 0 auto;
            border: 1px solid;
            border-radius: 999px;
            padding: 6px 9px;
            font-size: 11px;
            font-weight: 900;
            white-space: nowrap;
          }

          .pintarin-popup__grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 14px;
          }

          .pintarin-popup__metric {
            border: 1px solid rgba(255,255,255,0.74);
            border-radius: 16px;
            padding: 10px;
            background: rgba(248,250,252,0.68);
          }

          .pintarin-popup__metric span {
            display: block;
            margin-bottom: 4px;
            color: #64748B;
            font-size: 11px;
            font-weight: 700;
          }

          .pintarin-popup__metric strong {
            display: block;
            color: #102A43;
            font-size: 14px;
            font-weight: 900;
          }

          .pintarin-popup__note {
            margin: 12px 0 0;
            color: #64748B;
            font-size: 12px;
            line-height: 1.55;
          }
        `}
      </style>

      <MapContainer
        center={[-6.9175, 107.6191]}
        zoom={12}
        minZoom={11}
        maxZoom={16}
        scrollWheelZoom={false}
        maxBoundsViscosity={1}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributor'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoFocus geoJson={filteredGeoJson} />

        {filteredGeoJson && (
          <GeoJSON
            key={JSON.stringify(
              regions.map((region) => [
                region.region_code,
                region.name,
                region.dominant_risk_status || region.risk_status,
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
}
