const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const { pool, testDatabaseConnection } = require("../connection");

const AI_ALGORITHM = "FastAPI-Keras-Risk-Hybrid";
const DATASET_NAME = "PINTARIN_HASIL_PREDIKSI_AI_2026";
const MODEL_VERSION = "pintarin-hasil-prediksi-v2";
const DEFAULT_DATA_YEAR = Number(process.env.PINTARIN_AI_DATA_YEAR || 2025);
const DEFAULT_PREDICTION_YEAR = Number(
  process.env.PINTARIN_AI_PREDICTION_YEAR || DEFAULT_DATA_YEAR + 1,
);

const defaultCsvPath = path.join(
  __dirname,
  "data",
  "pintarin_hasil_prediksi.csv",
);

const normalizeColumnKey = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const normalizeName = (value = "") => {
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/KECAMATAN/g, "")
    .replace(/[^A-Z0-9]/g, "");
};

const normalizeRiskLabel = (value = "") => {
  const normalized = String(value).trim().toLowerCase();

  if (normalized.includes("rendah")) return "Rendah";
  if (normalized.includes("sedang")) return "Sedang";
  if (normalized.includes("tinggi")) return "Tinggi";

  return null;
};

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;

  const normalized = String(value)
    .trim()
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");
  const number = Number(normalized);

  return Number.isFinite(number) ? number : fallback;
};

const toInteger = (value, fallback = 0) => {
  const number = toNumber(value, fallback);

  return Number.isFinite(number) ? Math.round(number) : fallback;
};

const normalizeRecord = (record) => {
  const normalized = {};

  Object.entries(record).forEach(([key, value]) => {
    normalized[normalizeColumnKey(key)] = value;
  });

  return normalized;
};

const getField = (record, keys, fallback = null) => {
  for (const key of keys) {
    const normalizedKey = normalizeColumnKey(key);

    if (
      Object.prototype.hasOwnProperty.call(record, normalizedKey) &&
      record[normalizedKey] !== undefined &&
      record[normalizedKey] !== null &&
      record[normalizedKey] !== ""
    ) {
      return record[normalizedKey];
    }
  }

  return fallback;
};

const round = (value, decimals = 4) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;

  return Number(number.toFixed(decimals));
};

const average = (values) => {
  const numbers = values.map(Number).filter(Number.isFinite);
  if (numbers.length === 0) return 0;

  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
};

const getConfidenceScore = (riskScore) => {
  const score = Math.max(0, Math.min(toNumber(riskScore), 100));
  const distanceFromUncertain = Math.abs(score - 50) / 50;

  return round(Math.min(0.96, Math.max(0.55, 0.56 + distanceFromUncertain * 0.4)), 4);
};

const getConfidenceLevel = (confidenceScore) => {
  if (confidenceScore >= 0.85) return "Tinggi";
  if (confidenceScore >= 0.7) return "Sedang";
  return "Rendah";
};

const buildRecommendation = ({ riskStatus, pipGap, priorityScore }) => {
  const gapText = Math.round(toNumber(pipGap)).toLocaleString("id-ID");
  const priorityText = round(priorityScore, 1).toLocaleString("id-ID");

  if (riskStatus === "Tinggi") {
    return `Prioritas tinggi. Gap PIP sekitar ${gapText} dan priority score AI ${priorityText}; wilayah perlu validasi dan bantuan lebih cepat.`;
  }

  if (riskStatus === "Sedang") {
    return `Prioritas sedang. Gap PIP sekitar ${gapText}; wilayah perlu dipantau dan dapat dipilih untuk bantuan terarah.`;
  }

  return `Prioritas rendah. Gap PIP sekitar ${gapText}; bantuan tetap dapat dipantau sambil memprioritaskan wilayah dengan skor lebih tinggi.`;
};

const hasPredictionResultColumns = (record) => {
  return [
    "gap_pip",
    "risk_score_ai",
    "predicted_status",
    "priority_score",
    "ranking",
  ].every((key) => Object.prototype.hasOwnProperty.call(record, normalizeColumnKey(key)));
};

const getRegionLookup = async () => {
  const [regions] = await pool.query(`
    SELECT
      id,
      region_code,
      name,
      avg_population,
      avg_vulnerable_population,
      avg_vulnerable_ratio
    FROM regions
  `);

  const lookup = new Map();

  regions.forEach((region) => {
    lookup.set(normalizeName(region.name), region);
  });

  return lookup;
};

const buildIndicatorItems = ({ records, regionLookup, isPredictionResult }) => {
  const years = records
    .map((record) => Number(getField(record, ["Tahun", "year"])))
    .filter(Boolean);
  const yearMin = years.length ? Math.min(...years) : DEFAULT_DATA_YEAR;
  const yearMax = years.length ? Math.max(...years) : DEFAULT_DATA_YEAR;
  const yearRange = yearMax - yearMin || 1;

  let matchedRegionCount = 0;
  let unmatchedRegionCount = 0;

  const items = records.map((record, index) => {
    const kecamatan = String(getField(record, ["Kecamatan"], "") || "")
      .trim()
      .toUpperCase();
    const region = regionLookup.get(normalizeName(kecamatan)) || null;

    if (region) {
      matchedRegionCount += 1;
    } else {
      unmatchedRegionCount += 1;
    }

    const year = toInteger(
      getField(record, ["Tahun", "year"]),
      DEFAULT_DATA_YEAR,
    );
    const totalVulnerablePopulation = toNumber(
      getField(record, ["Total_Warga_Rentan", "total_vulnerable_population"]),
    );
    const totalPipAid = toNumber(
      getField(record, ["Total_Bantuan_PIP", "total_pip_aid"]),
    );
    const vulnerableRatio = toNumber(
      getField(record, ["Rasio_Warga_Rentan", "vulnerable_ratio"]),
    );
    const totalPopulationFromRatio =
      vulnerableRatio > 0
        ? totalVulnerablePopulation / (vulnerableRatio / 100)
        : 0;
    const totalPopulation = toInteger(
      getField(record, ["Total_Populasi", "total_population"]),
      Math.round(totalPopulationFromRatio || Number(region?.avg_population || 0)),
    );
    const totalPreSchool = toNumber(
      getField(record, ["Total_Pra_Sekolah", "total_pre_school"]),
    );
    const sdCount = toNumber(getField(record, ["SD", "sd_count"]));
    const riskScore = toNumber(getField(record, ["Risk_Score_AI", "risk_score"]));
    const priorityScore = toNumber(getField(record, ["Priority_Score"]));
    const ranking = toInteger(getField(record, ["Ranking"]), index + 1);
    const historicalRiskLabel = normalizeRiskLabel(
      getField(record, [
        "Predicted_Status",
        "Status_Resiko",
        "risk_status",
        "historical_risk_label",
      ]),
    );

    const rasioPipPerRentan =
      totalVulnerablePopulation > 0
        ? (totalPipAid / totalVulnerablePopulation) * 100
        : 0;
    const rasioSdPerPopulasi =
      totalPopulation > 0 ? sdCount / (totalPopulation / 10000) : 0;
    const gapBantuan = isPredictionResult
      ? toNumber(
          getField(record, ["GAP_PIP", "gap_pip"]),
          totalVulnerablePopulation - totalPipAid,
        )
      : totalVulnerablePopulation - totalPipAid;
    const urgencyScore = isPredictionResult && priorityScore > 0
      ? priorityScore
      : vulnerableRatio * (1 - rasioPipPerRentan / 100);
    const tahunNorm = years.length ? (year - yearMin) / yearRange : 0;

    return {
      sourceDataset: DATASET_NAME,
      sourceRowNumber: index + 1,
      region,
      regionId: region?.id || null,
      kecamatan,
      year,
      totalPopulation,
      totalVulnerablePopulation,
      totalPipAid,
      totalPreSchool,
      sdCount,
      vulnerableRatio,
      historicalRiskLabel,
      rasioPipPerRentan,
      rasioSdPerPopulasi,
      gapBantuan,
      urgencyScore,
      tahunNorm,
      ai: {
        riskScore,
        priorityScore,
        ranking,
        predictedStatus: historicalRiskLabel || "Sedang",
      },
    };
  });

  return {
    items,
    matchedRegionCount,
    unmatchedRegionCount,
    yearMin,
    yearMax,
  };
};

const toIndicatorRows = (items) =>
  items.map((item) => [
    item.sourceDataset,
    item.sourceRowNumber,
    item.regionId,
    item.kecamatan,
    item.year,

    item.totalPopulation,
    item.totalVulnerablePopulation,
    item.totalPipAid,
    item.totalPreSchool,
    item.sdCount,
    item.vulnerableRatio,

    item.historicalRiskLabel,

    item.rasioPipPerRentan,
    item.rasioSdPerPopulasi,
    item.gapBantuan,
    item.urgencyScore,
    item.tahunNorm,
  ]);

const insertIndicatorRows = async (connection, rows) => {
  const batchSize = 500;
  let inserted = 0;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);

    const placeholders = batch
      .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");

    await connection.query(
      `
      INSERT INTO education_indicators (
        source_dataset,
        source_row_number,
        region_id,
        kecamatan,
        year,

        total_population,
        total_vulnerable_population,
        total_pip_aid,
        total_pre_school,
        sd_count,
        vulnerable_ratio,

        historical_risk_label,

        rasio_pip_per_rentan,
        rasio_sd_per_populasi,
        gap_bantuan,
        urgency_score,
        tahun_norm
      )
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        region_id = VALUES(region_id),
        kecamatan = VALUES(kecamatan),
        year = VALUES(year),

        total_population = VALUES(total_population),
        total_vulnerable_population = VALUES(total_vulnerable_population),
        total_pip_aid = VALUES(total_pip_aid),
        total_pre_school = VALUES(total_pre_school),
        sd_count = VALUES(sd_count),
        vulnerable_ratio = VALUES(vulnerable_ratio),

        historical_risk_label = VALUES(historical_risk_label),

        rasio_pip_per_rentan = VALUES(rasio_pip_per_rentan),
        rasio_sd_per_populasi = VALUES(rasio_sd_per_populasi),
        gap_bantuan = VALUES(gap_bantuan),
        urgency_score = VALUES(urgency_score),
        tahun_norm = VALUES(tahun_norm),
        updated_at = CURRENT_TIMESTAMP
      `,
      batch.flat(),
    );

    inserted += batch.length;
    console.log(`Imported education indicators ${inserted}/${rows.length}`);
  }
};

const groupByRegionYear = (items) => {
  const groups = new Map();

  items
    .filter((item) => item.regionId)
    .forEach((item) => {
      const key = `${item.regionId}-${item.year}`;

      if (!groups.has(key)) {
        groups.set(key, {
          region: item.region,
          regionId: item.regionId,
          year: item.year,
          items: [],
        });
      }

      groups.get(key).items.push(item);
    });

  return [...groups.values()].map((group) => {
    const sortedByPriority = [...group.items].sort((a, b) => {
      const rankDiff = toNumber(a.ai.ranking, 999999) - toNumber(b.ai.ranking, 999999);
      if (rankDiff !== 0) return rankDiff;

      return b.ai.priorityScore - a.ai.priorityScore;
    });
    const best = sortedByPriority[0];

    return {
      ...group,
      best,
      recordCount: group.items.length,
      averagePopulation: average(group.items.map((item) => item.totalPopulation)),
      averageVulnerablePopulation: average(
        group.items.map((item) => item.totalVulnerablePopulation),
      ),
      averagePipAid: average(group.items.map((item) => item.totalPipAid)),
      averagePreSchool: average(group.items.map((item) => item.totalPreSchool)),
      averageSdCount: average(group.items.map((item) => item.sdCount)),
      averageVulnerableRatio: average(group.items.map((item) => item.vulnerableRatio)),
      averagePipGap: average(group.items.map((item) => item.gapBantuan)),
      averagePipCoverage: average(group.items.map((item) => item.rasioPipPerRentan)),
      averagePriorityScore: average(group.items.map((item) => item.ai.priorityScore)),
      averageRiskScore: average(group.items.map((item) => item.ai.riskScore)),
    };
  });
};

const rankGroups = (groups) => {
  return [...groups]
    .sort((a, b) => {
      const priorityDiff = b.best.ai.priorityScore - a.best.ai.priorityScore;
      if (priorityDiff !== 0) return priorityDiff;

      return b.best.ai.riskScore - a.best.ai.riskScore;
    })
    .map((group, index) => ({
      ...group,
      riskRanking: index + 1,
    }));
};

const upsertAnalyticsSnapshots = async (connection, groups) => {
  if (!groups.length) return;

  const rows = groups.map((group) => {
    const best = group.best;
    const analyticsCode = `AI-SNAP-${group.regionId}-${group.year}`;

    return [
      analyticsCode,
      group.regionId,
      group.year,
      Math.round(best.totalPopulation || group.averagePopulation),
      best.totalVulnerablePopulation,
      best.vulnerableRatio,
      best.totalPipAid,
      best.rasioPipPerRentan,
      best.totalPreSchool || group.averagePreSchool,
      best.sdCount || group.averageSdCount,
      best.ai.predictedStatus,
      best.sdCount || group.averageSdCount,
      0,
      0,
      best.ai.riskScore || group.averageRiskScore,
      best.gapBantuan || group.averagePipGap,
      group.riskRanking,
    ];
  });

  const placeholders = rows
    .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .join(", ");

  await connection.query(
    `
    INSERT INTO analytics_snapshots (
      analytics_code,
      region_id,
      year,
      total_population,
      total_vulnerable_population,
      vulnerable_ratio,
      total_pip_aid,
      pip_coverage_pct,
      total_pre_school,
      sd_count,
      risk_status,
      total_schools_in_region,
      total_csr_programs,
      total_csr_value,
      vulnerability_index,
      pip_gap,
      risk_ranking
    )
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      analytics_code = VALUES(analytics_code),
      total_population = VALUES(total_population),
      total_vulnerable_population = VALUES(total_vulnerable_population),
      vulnerable_ratio = VALUES(vulnerable_ratio),
      total_pip_aid = VALUES(total_pip_aid),
      pip_coverage_pct = VALUES(pip_coverage_pct),
      total_pre_school = VALUES(total_pre_school),
      sd_count = VALUES(sd_count),
      risk_status = VALUES(risk_status),
      total_schools_in_region = VALUES(total_schools_in_region),
      vulnerability_index = VALUES(vulnerability_index),
      pip_gap = VALUES(pip_gap),
      risk_ranking = VALUES(risk_ranking)
    `,
    rows.flat(),
  );
};

const upsertPredictions = async (connection, groups) => {
  if (!groups.length) return;

  const rows = groups.map((group) => {
    const best = group.best;
    const confidenceScore = getConfidenceScore(best.ai.riskScore);
    const confidenceLevel = getConfidenceLevel(confidenceScore);
    const predictedLabel = best.ai.predictedStatus;
    const predictionCode = `AI-${group.regionId}-${group.year}-${DEFAULT_PREDICTION_YEAR}`;

    const inputFeatures = {
      source: "pintarin_hasil_prediksi_csv",
      source_dataset: DATASET_NAME,
      source_record_count: group.recordCount,
      region_code: group.region.region_code,
      region_name: group.region.name,
      payload: {
        rasio_pip_per_rentan: best.rasioPipPerRentan,
        rasio_sd_per_populasi: best.rasioSdPerPopulasi,
        gap_bantuan: best.gapBantuan,
        urgency_score: best.urgencyScore,
        total_pra_sekolah: best.totalPreSchool,
        tahun_norm: best.tahunNorm,
      },
      aggregates: {
        total_population: best.totalPopulation,
        total_vulnerable_population: best.totalVulnerablePopulation,
        total_pip_aid: best.totalPipAid,
        sd_count: best.sdCount,
        vulnerable_ratio: best.vulnerableRatio,
      },
    };

    const aiResponse = {
      source_dataset: DATASET_NAME,
      selected_source_row_number: best.sourceRowNumber,
      risk_score_ai: best.ai.riskScore,
      predicted_status: predictedLabel,
      priority_score: best.ai.priorityScore,
      ranking: best.ai.ranking,
      average_risk_score: round(group.averageRiskScore),
      average_priority_score: round(group.averagePriorityScore),
    };

    return [
      predictionCode,
      group.regionId,
      group.year,
      DEFAULT_PREDICTION_YEAR,
      MODEL_VERSION,
      AI_ALGORITHM,
      JSON.stringify(inputFeatures),
      JSON.stringify(aiResponse),
      null,
      best.ai.riskScore,
      best.ai.priorityScore,
      null,
      predictedLabel,
      predictedLabel,
      confidenceScore,
      confidenceLevel,
      buildRecommendation({
        riskStatus: predictedLabel,
        pipGap: best.gapBantuan,
        priorityScore: best.ai.priorityScore,
      }),
      confidenceScore < 0.7,
      false,
    ];
  });

  const placeholders = rows
    .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .join(", ");

  await connection.query(
    `
    INSERT INTO predictions (
      prediction_code,
      region_id,
      data_year,
      prediction_year,
      model_version,
      algorithm,
      input_features,
      ai_response,
      actual_score,
      predicted_score,
      priority_score,
      actual_label,
      predicted_label,
      final_label,
      confidence_score,
      confidence_level,
      recommendation_text,
      needs_human_review,
      is_human_validated
    )
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      model_version = VALUES(model_version),
      algorithm = VALUES(algorithm),
      input_features = VALUES(input_features),
      ai_response = VALUES(ai_response),
      actual_score = VALUES(actual_score),
      predicted_score = VALUES(predicted_score),
      priority_score = VALUES(priority_score),
      actual_label = VALUES(actual_label),
      predicted_label = VALUES(predicted_label),
      final_label = IF(is_human_validated = TRUE, final_label, VALUES(final_label)),
      confidence_score = VALUES(confidence_score),
      confidence_level = VALUES(confidence_level),
      recommendation_text = VALUES(recommendation_text),
      needs_human_review = IF(is_human_validated = TRUE, FALSE, VALUES(needs_human_review)),
      updated_at = CURRENT_TIMESTAMP
    `,
    rows.flat(),
  );
};

const updateRegionSummaries = async (connection, groups) => {
  for (const group of groups) {
    const best = group.best;

    await connection.query(
      `
      UPDATE regions
      SET
        avg_population = ?,
        avg_vulnerable_population = ?,
        avg_vulnerable_ratio = ?,
        dominant_risk_status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        Math.round(best.totalPopulation || group.averagePopulation),
        best.totalVulnerablePopulation,
        best.vulnerableRatio,
        best.ai.predictedStatus,
        group.regionId,
      ],
    );
  }
};

const importData = async ({ connection, items, isPredictionResult }) => {
  await connection.query("DELETE FROM education_indicators");
  await insertIndicatorRows(connection, toIndicatorRows(items));

  if (!isPredictionResult) return { groups: [] };

  const groups = rankGroups(groupByRegionYear(items));

  await upsertAnalyticsSnapshots(connection, groups);
  await upsertPredictions(connection, groups);
  await updateRegionSummaries(connection, groups);

  return { groups };
};

const main = async () => {
  const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultCsvPath;

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  await testDatabaseConnection();

  const csvContent = fs.readFileSync(csvPath, "utf8");

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }).map(normalizeRecord);

  if (records.length === 0) {
    throw new Error("CSV is empty.");
  }

  const isPredictionResult = hasPredictionResultColumns(records[0]);
  const regionLookup = await getRegionLookup();

  const {
    items,
    matchedRegionCount,
    unmatchedRegionCount,
    yearMin,
    yearMax,
  } = buildIndicatorItems({
    records,
    regionLookup,
    isPredictionResult,
  });

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { groups } = await importData({
      connection,
      items,
      isPredictionResult,
    });

    await connection.commit();

    console.log("AI education indicators import completed.");
    console.log(`Dataset       : ${DATASET_NAME}`);
    console.log(`Mode          : ${isPredictionResult ? "prediction-result" : "indicator"}`);
    console.log(`Rows          : ${items.length}`);
    console.log(`Year range    : ${yearMin} - ${yearMax}`);
    console.log(`Matched region: ${matchedRegionCount}`);
    console.log(`Unmatched     : ${unmatchedRegionCount}`);
    console.log(`AI regions    : ${groups.length}`);
    console.log(`Prediction yr : ${isPredictionResult ? DEFAULT_PREDICTION_YEAR : "-"}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

main()
  .catch((error) => {
    console.error("Import failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
