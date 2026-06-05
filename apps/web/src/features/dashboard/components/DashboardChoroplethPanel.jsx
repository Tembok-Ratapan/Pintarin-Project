import { useEffect, useMemo, useState } from "react";

import RiskChoroplethMap from "../../../components/map/RiskChoroplethMap";
import { riskLegendItems } from "../../../components/map/riskMapUtils";
import DashboardEmptyState from "./DashboardEmptyState";
import DashboardSection from "./DashboardSection";

export default function DashboardChoroplethPanel({ regions = [], topRegions = [] }) {
  const [geoJson, setGeoJson] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const mapRegions = useMemo(() => {
    return regions.length > 0 ? regions : topRegions;
  }, [regions, topRegions]);

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

  return (
    <DashboardSection
      action={
        <div className="flex flex-wrap gap-3 text-xs font-extrabold text-[#64748B]">
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
        <RiskChoroplethMap
          geoJson={geoJson}
          regions={mapRegions}
          heightClassName="h-[330px] sm:h-[420px] lg:h-[470px]"
        />
      )}
    </DashboardSection>
  );
}
