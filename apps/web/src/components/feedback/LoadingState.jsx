import { useEffect, useMemo, useState } from "react";

const GEOJSON_URL = "/geojson/bandung-kecamatan.geojson";

const getCoordinates = (geometry) => {
  if (!geometry) return [];

  if (geometry.type === "Polygon") {
    return geometry.coordinates;
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat();
  }

  return [];
};

const flattenPoints = (features) => {
  return features.flatMap((feature) =>
    getCoordinates(feature.geometry).flatMap((polygon) => polygon),
  );
};

const buildSvgPaths = (geoJson, width = 320, height = 230, padding = 18) => {
  const features = geoJson?.features || [];
  const points = flattenPoints(features);

  if (points.length === 0) return [];

  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const lngRange = maxLng - minLng || 1;
  const latRange = maxLat - minLat || 1;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const scale = Math.min(usableWidth / lngRange, usableHeight / latRange);
  const renderedWidth = lngRange * scale;
  const renderedHeight = latRange * scale;
  const offsetX = (width - renderedWidth) / 2;
  const offsetY = (height - renderedHeight) / 2;

  const project = ([lng, lat]) => {
    const x = offsetX + (lng - minLng) * scale;
    const y = offsetY + (maxLat - lat) * scale;

    return [x, y];
  };

  return features.flatMap((feature) =>
    getCoordinates(feature.geometry).map((polygon, index) => {
      const commands = polygon.map((point, pointIndex) => {
        const [x, y] = project(point);

        return `${pointIndex === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      });

      return {
        id: `${feature.properties?.id || feature.properties?.name || feature.id || "region"}-${index}`,
        d: `${commands.join(" ")} Z`,
      };
    }),
  );
};

function BlinkingBandungMap() {
  const [geoJson, setGeoJson] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(GEOJSON_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("GeoJSON not found.");
        return response.json();
      })
      .then((data) => setGeoJson(data))
      .catch(() => setGeoJson(null));

    return () => controller.abort();
  }, []);

  const paths = useMemo(() => buildSvgPaths(geoJson), [geoJson]);

  if (paths.length === 0) {
    return (
      <div className="h-20 w-28 animate-pulse rounded-[48%_52%_46%_54%/44%_56%_44%_56%] bg-[linear-gradient(135deg,#5EEAD4,#0F766E)] shadow-[0_18px_32px_rgba(15,118,110,0.2)]" />
    );
  }

  return (
    <svg
      viewBox="0 0 320 230"
      className="h-auto w-32 overflow-visible drop-shadow-[0_18px_26px_rgba(15,118,110,0.18)]"
      role="img"
      aria-label="Animasi peta Kota Bandung"
    >
      <defs>
        <linearGradient id="loadingBandungFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="52%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
      </defs>

      <g>
        {paths.map((path, index) => (
          <path
            key={path.id}
            d={path.d}
            fill="url(#loadingBandungFill)"
            stroke="rgba(255,255,255,0.58)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="pintarin-loading-map-path"
            style={{ animationDelay: `${(index % 8) * 0.12}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

export default function LoadingState({ label = "" }) {
  return (
    <div className="flex min-h-[15rem] items-center justify-center p-6 text-center">
      <style>
        {`
          @keyframes pintarin-loading-blink {
            0%, 100% {
              opacity: 0.28;
              transform: scale(0.985);
            }
            45% {
              opacity: 1;
              transform: scale(1.012);
            }
          }

          .pintarin-loading-map-path {
            animation: pintarin-loading-blink 1.45s ease-in-out infinite;
            transform-origin: center;
          }
        `}
      </style>

      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute left-1/2 top-1/2 h-24 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5EEAD4]/24 blur-2xl" />
          <div className="relative">
            <BlinkingBandungMap />
          </div>
        </div>

        <p className="mt-4 text-sm font-extrabold text-[#102A43]">
          Tunggu Sebentar
        </p>

        {label && (
          <p className="mt-1 max-w-sm text-xs font-semibold leading-5 text-[#64748B]">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
