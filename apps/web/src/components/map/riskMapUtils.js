export const riskThemeByStatus = {
  Tinggi: {
    status: "Tinggi",
    label: "Prioritas AI Tinggi",
    shortLabel: "Tinggi",
    fillColor: "#dc2626",
    borderColor: "#7f1d1d",
    softBg: "rgba(220, 38, 38, 0.12)",
    badgeClass:
      "bg-red-100/75 text-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
    dotClass: "bg-red-600",
    barClass: "bg-red-600",
  },
  Sedang: {
    status: "Sedang",
    label: "Prioritas AI Sedang",
    shortLabel: "Sedang",
    fillColor: "#f59e0b",
    borderColor: "#92400e",
    softBg: "rgba(245, 158, 11, 0.14)",
    badgeClass:
      "bg-amber-100/75 text-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
    dotClass: "bg-amber-500",
    barClass: "bg-amber-500",
  },
  Rendah: {
    status: "Rendah",
    label: "Prioritas AI Rendah",
    shortLabel: "Rendah",
    fillColor: "#059669",
    borderColor: "#064e3b",
    softBg: "rgba(5, 150, 105, 0.12)",
    badgeClass:
      "bg-emerald-100/75 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
    dotClass: "bg-emerald-600",
    barClass: "bg-emerald-600",
  },
};

export const riskLegendItems = [
  riskThemeByStatus.Tinggi,
  riskThemeByStatus.Sedang,
  riskThemeByStatus.Rendah,
];

export const normalizeMapKey = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/KECAMATAN/g, "")
    .replace(/[^A-Z0-9]/g, "");

export const getFeatureDistrictName = (feature) => {
  const properties = feature?.properties || {};

  return (
    properties.name ||
    properties.nama ||
    properties.NAME ||
    properties.NAMOBJ ||
    properties.NAMOBJ_Kec ||
    properties.WADMKC ||
    properties.wadmkc ||
    properties.kecamatan ||
    properties.KECAMATAN ||
    properties.nama_kecamatan ||
    properties.NAMA_KEC ||
    properties.NAMKEC ||
    ""
  );
};

export const getFeatureDistrictCode = (feature) => {
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

export const getRegionName = (region) => {
  return region?.name || region?.region_name || region?.nama_kecamatan || "";
};

export const getRegionCode = (region) => {
  return region?.region_code || region?.code || region?.id || getRegionName(region);
};

export const getAiRiskStatus = (region, fallback = "Sedang") => {
  return (
    region?.risk_status ||
    region?.dominant_risk_status ||
    region?.final_label ||
    region?.predicted_label ||
    fallback
  );
};

export const getRiskTheme = (status) => {
  return riskThemeByStatus[status] || riskThemeByStatus.Sedang;
};

export const buildRegionLookup = (regions = []) => {
  const lookup = new Map();

  regions.forEach((region) => {
    const name = normalizeMapKey(getRegionName(region));
    const code = normalizeMapKey(getRegionCode(region));

    if (name) lookup.set(name, region);
    if (code) lookup.set(code, region);
  });

  return lookup;
};

export const getRegionFromFeature = (feature, regionLookup) => {
  const districtName = normalizeMapKey(getFeatureDistrictName(feature));
  const districtCode = normalizeMapKey(getFeatureDistrictCode(feature));

  return regionLookup.get(districtName) || regionLookup.get(districtCode) || null;
};

export const getRegionMetrics = (region) => {
  const rawVulnerableRatio = Number(
    region?.avg_vulnerable_ratio || region?.vulnerable_ratio || 0,
  );

  return {
    vulnerablePopulation:
      region?.total_vulnerable_population ||
      region?.avg_vulnerable_population ||
      region?.vulnerable_population ||
      0,
    vulnerableRatio:
      rawVulnerableRatio > 1 ? rawVulnerableRatio : rawVulnerableRatio * 100,
    pipGap: region?.pip_gap || region?.avg_pip_gap || region?.gap_pip || 0,
    schools: region?.total_schools || region?.school_count || 0,
    priorityScore: region?.priority_score || region?.risk_score || 0,
    predictedScore: region?.predicted_score || region?.risk_score || 0,
  };
};
