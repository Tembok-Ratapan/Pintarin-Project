import { useEffect, useMemo, useState } from "react";
import { Layers3, MapPinned, TrendingUp } from "lucide-react";

import RiskChoroplethMap from "../../../components/map/RiskChoroplethMap";
import {
  getAiRiskStatus,
  getRegionCode,
  getRiskTheme,
  riskLegendItems,
} from "../../../components/map/riskMapUtils";
import api from "../../../lib/api";
import { formatNumber, formatPercent } from "../../../lib/utils";
import Badge from "../../../components/ui/Badge";
import { Card, CardContent } from "../../../components/ui/Card";
import LoadingState from "../../../components/feedback/LoadingState";

const mapStats = [
  {
    key: "total_regions",
    label: "Kecamatan",
    icon: MapPinned,
    format: formatNumber,
  },
  {
    key: "high_risk_regions",
    label: "Risiko Tinggi",
    icon: TrendingUp,
    format: formatNumber,
  },
  {
    key: "avg_confidence_score",
    label: "Confidence",
    icon: Layers3,
    format: (value) => formatPercent(Number(value || 0) * 100),
  },
];

const riskPriority = {
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

const getVulnerablePopulation = (region) =>
  region?.total_vulnerable_population ||
  region?.avg_vulnerable_population ||
  region?.vulnerable_population ||
  0;

const getPipGap = (region) => region?.pip_gap || region?.avg_pip_gap || 0;

const normalizePriorityRegion = (region, index) => {
  const riskStatus = getAiRiskStatus(region);

  return {
    id: region.id || region.region_id || region.region_code || region.name,
    region_code: region.region_code,
    name: region.name || region.region_name || "Wilayah",
    risk_status: riskStatus,
    risk_ranking:
      Number(region.risk_ranking || region.rank || index + 1) || index + 1,
    total_vulnerable_population: getVulnerablePopulation(region),
    pip_gap: getPipGap(region),
    avg_vulnerable_ratio:
      region.avg_vulnerable_ratio || region.vulnerable_ratio,
  };
};

const getPriorityWidth = (ranking) => {
  const rank = Number(ranking || 10);
  return `${Math.max(42, 100 - (rank - 1) * 5.6)}%`;
};

export default function RiskMapSection() {
  const [summary, setSummary] = useState(null);
  const [regions, setRegions] = useState([]);
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchMapData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const [summaryResponse, regionsResponse, geoJsonResponse] =
          await Promise.all([
            api.get("/analytics/summary", { signal: controller.signal }),
            api.get("/regions", { signal: controller.signal }),
            fetch("/geojson/bandung-kecamatan.geojson", {
              signal: controller.signal,
            }).then((response) => {
              if (!response.ok) {
                throw new Error("GeoJSON file not found.");
              }

              return response.json();
            }),
          ]);

        const regionPayload = regionsResponse.data?.data;

        const regionList = Array.isArray(regionPayload)
          ? regionPayload
          : Array.isArray(regionPayload?.regions)
            ? regionPayload.regions
            : [];

        setSummary(summaryResponse.data?.data || null);
        setRegions(regionList);
        setGeoJson(geoJsonResponse);
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          setErrorMessage(
            "Data peta prioritas belum bisa terhubung ke API atau file GeoJSON.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();

    return () => controller.abort();
  }, []);

  const data = summary?.summary || {};
  const topPriorityRegions = useMemo(() => {
    const usedCodes = new Set();
    const summaryTopRegions = summary?.top_risk_regions || [];

    const summaryRegions = summaryTopRegions.map((region, index) => {
      const normalized = normalizePriorityRegion(region, index);
      usedCodes.add(normalizeText(getRegionCode(normalized)));
      usedCodes.add(normalizeText(normalized.name));
      return normalized;
    });

    const derivedRegions = regions
      .map((region, index) => normalizePriorityRegion(region, index))
      .filter((region) => {
        const code = normalizeText(getRegionCode(region));
        const name = normalizeText(region.name);
        return !usedCodes.has(code) && !usedCodes.has(name);
      })
      .sort((a, b) => {
        const riskDiff =
          (riskPriority[b.risk_status] || 0) -
          (riskPriority[a.risk_status] || 0);

        if (riskDiff !== 0) return riskDiff;

        return (
          Number(b.total_vulnerable_population || 0) -
          Number(a.total_vulnerable_population || 0)
        );
      });

    return [...summaryRegions, ...derivedRegions]
      .slice(0, 10)
      .map((region, index) => ({
        ...region,
        risk_ranking: index + 1,
      }));
  }, [regions, summary]);

  const highRiskTopCount = topPriorityRegions.filter(
    (region) => region.risk_status === "Tinggi",
  ).length;

  const getStatValue = (key) => {
    if (key === "total_regions") return data.total_regions || regions.length;
    return data[key];
  };

  return (
    <section
      id="risk-map"
      className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10 xl:px-12"
    >
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <h2 className="font-heading text-balance text-3xl font-extrabold leading-[1.08] text-[#102A43] sm:text-4xl">
            Peta Risiko Pendidikan
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-3 lg:w-[25.5rem]">
          {mapStats.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.key}
                className="h-[4.35rem] rounded-[1rem] transition hover:bg-white/48"
              >
                <CardContent className="flex h-full items-center p-2.5">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div>
                      <p className="text-[0.62rem] font-bold uppercase leading-tight text-[#64748B]">
                        {item.label}
                      </p>

                      <p className="font-heading mt-1 text-lg font-extrabold leading-none text-[#102A43]">
                        {item.format(getStatValue(item.key))}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#5EEAD4]/16 p-1.5 text-[#0F766E]">
                      <Icon size={15} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Menyiapkan map risk..." />
      ) : errorMessage ? (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
            <p className="mt-1 text-sm text-[#64748B]">
              Pastikan backend berjalan di{" "}
              <strong>http://localhost:5000</strong> dan file GeoJSON tersedia
              di <strong>public/geojson/bandung-kecamatan.geojson</strong>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-7">
          <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-5 lg:p-6">
              <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-extrabold text-[#102A43]">
                    Kota Bandung
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#475569]">
                  {riskLegendItems.map((item) => (
                    <div key={item.status} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fillColor }}
                      />
                      <span>{item.shortLabel}</span>
                    </div>
                  ))}
                </div>
              </div>

              <RiskChoroplethMap geoJson={geoJson} regions={regions} />
            </CardContent>
          </Card>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h3 className="font-heading text-2xl font-extrabold leading-tight text-[#102A43]">
                  Top 10 Wilayah Prioritas
                </h3>
              </div>

              <Badge variant="red">
                {formatNumber(highRiskTopCount)} risiko tinggi
              </Badge>
            </div>

            {topPriorityRegions.length === 0 ? (
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-[#64748B]">
                    Belum ada data wilayah prioritas yang tersedia.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {topPriorityRegions.map((region) => {
                  const theme = getRiskTheme(region.risk_status);

                  return (
                    <Card
                      key={`${region.region_code || region.name}-${region.risk_ranking}`}
                      className="group transition duration-200 hover:-translate-y-1 hover:bg-white/50 hover:shadow-2xl hover:shadow-slate-300/25"
                    >
                      <CardContent className="flex h-full flex-col p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dotClass}`}
                              />
                              <p className="truncate text-xs font-extrabold uppercase text-[#102A43]">
                                {region.name}
                              </p>
                            </div>

                            <p className="text-xs leading-5 text-[#64748B]">
                              Warga rentan:{" "}
                              {formatNumber(region.total_vulnerable_population)}
                            </p>
                            <p className="text-xs leading-5 text-[#64748B]">
                              Gap PIP: {formatNumber(region.pip_gap)}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${theme.badgeClass}`}
                          >
                            #{region.risk_ranking}
                          </span>
                        </div>

                        <div className="mt-auto pt-5">
                          <div className="mb-2 flex justify-between gap-3 text-xs font-semibold text-[#64748B]">
                            <span>Bobot AI</span>
                            <span>{region.risk_status}</span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/60">
                            <div
                              className={`h-full rounded-full ${theme.barClass}`}
                              style={{
                                width: getPriorityWidth(region.risk_ranking),
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
