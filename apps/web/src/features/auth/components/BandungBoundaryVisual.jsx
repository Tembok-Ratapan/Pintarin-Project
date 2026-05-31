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

const buildSvgPaths = (geoJson, width = 760, height = 520, padding = 56) => {
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

export default function BandungBoundaryVisual() {
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

  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[#F4FBFA] lg:block">
      <style>
        {`
          @keyframes pintarin-map-float {
            0%, 100% {
              transform: translate3d(0, 0, 0) rotate(-1.8deg);
            }
            50% {
              transform: translate3d(0, -18px, 0) rotate(1deg);
            }
          }

          @keyframes pintarin-glow {
            0%, 100% {
              opacity: 0.45;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.85;
              transform: translate(-50%, -50%) scale(1.08);
            }
          }

          .pintarin-map-float {
            animation: pintarin-map-float 7.5s ease-in-out infinite;
          }

          .pintarin-map-glow {
            animation: pintarin-glow 5.8s ease-in-out infinite;
          }
        `}
      </style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(94,234,212,0.26),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(15,118,110,0.13),transparent_32%),linear-gradient(135deg,#FFFFFF_0%,#ECFEFF_45%,#F8FAFC_100%)]" />

      <div className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-[#5EEAD4]/24 blur-3xl" />
      <div className="absolute bottom-10 left-12 h-80 w-80 rounded-full bg-[#0F766E]/10 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-10 py-10">
        <div className="relative aspect-[1.25/1] w-full max-w-[720px]">
          <div className="pintarin-map-glow absolute left-1/2 top-1/2 h-[62%] w-[76%] rounded-full bg-[#5EEAD4]/26 blur-3xl" />

          <div className="pintarin-map-float absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="absolute inset-x-[9%] bottom-[11%] h-12 rounded-full bg-[#0F766E]/16 blur-2xl" />

              {paths.length > 0 ? (
                <svg
                  viewBox="0 0 760 520"
                  className="relative h-auto w-[88%] overflow-visible drop-shadow-[0_38px_42px_rgba(15,118,110,0.22)]"
                  role="img"
                  aria-label="Batas wilayah Kota Bandung"
                >
                  <defs>
                    <linearGradient
                      id="bandungFloatingFill"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#5EEAD4" />
                      <stop offset="48%" stopColor="#14B8A6" />
                      <stop offset="100%" stopColor="#0F766E" />
                    </linearGradient>
                  </defs>

                  <g>
                    {paths.map((path) => (
                      <path
                        key={path.id}
                        d={path.d}
                        fill="url(#bandungFloatingFill)"
                        stroke="rgba(255,255,255,0.42)"
                        strokeWidth="1.25"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </g>
                </svg>
              ) : (
                <div className="h-52 w-[78%] rounded-[52%_48%_46%_54%/44%_56%_44%_56%] bg-[linear-gradient(135deg,#5EEAD4,#0F766E)] shadow-[0_38px_54px_rgba(15,118,110,0.24)]" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}