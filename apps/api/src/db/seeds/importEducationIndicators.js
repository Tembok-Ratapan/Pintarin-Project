const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const { pool, testDatabaseConnection } = require('../connection')

const DATASET_NAME = 'PINTARIN_MASTER_FINAL_5000_TERBARU'

const defaultCsvPath = path.join(
  __dirname,
  'data',
  'PINTARIN_MASTER_FINAL_5000_TERBARU.csv'
)

const normalizeName = (value = '') => {
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/KECAMATAN/g, '')
    .replace(/[^A-Z0-9]/g, '')
}

const normalizeRiskLabel = (value = '') => {
  const normalized = String(value).trim().toLowerCase()

  if (normalized === 'rendah') return 'Rendah'
  if (normalized === 'sedang') return 'Sedang'
  if (normalized === 'tinggi') return 'Tinggi'

  return null
}

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return 0

  const normalized = String(value).replace(',', '.')
  const number = Number(normalized)

  return Number.isFinite(number) ? number : 0
}

const getRegionLookup = async () => {
  const [regions] = await pool.query(`
    SELECT id, name
    FROM regions
  `)

  const lookup = new Map()

  regions.forEach((region) => {
    lookup.set(normalizeName(region.name), region.id)
  })

  return lookup
}

const buildRows = ({ records, regionLookup }) => {
  const years = records.map((record) => Number(record.Tahun)).filter(Boolean)
  const yearMin = Math.min(...years)
  const yearMax = Math.max(...years)
  const yearRange = yearMax - yearMin || 1

  let matchedRegionCount = 0
  let unmatchedRegionCount = 0

  const rows = records.map((record, index) => {
    const kecamatan = String(record.Kecamatan || '').trim().toUpperCase()
    const normalizedKecamatan = normalizeName(kecamatan)
    const regionId = regionLookup.get(normalizedKecamatan) || null

    if (regionId) {
      matchedRegionCount += 1
    } else {
      unmatchedRegionCount += 1
    }

    const year = Number(record.Tahun)
    const totalPopulation = toNumber(record.Total_Populasi)
    const totalVulnerablePopulation = toNumber(record.Total_Warga_Rentan)
    const totalPipAid = toNumber(record.Total_Bantuan_PIP)
    const totalPreSchool = toNumber(record.Total_Pra_Sekolah)
    const sdCount = toNumber(record.SD)
    const vulnerableRatio = toNumber(record.Rasio_Warga_Rentan)
    const historicalRiskLabel = normalizeRiskLabel(record.Status_Resiko)

    const rasioPipPerRentan =
      (totalPipAid / (totalVulnerablePopulation + 1)) * 100

    const rasioSdPerPopulasi =
      totalPopulation > 0 ? sdCount / (totalPopulation / 10000) : 0

    const gapBantuan = totalVulnerablePopulation - totalPipAid

    const urgencyScore =
      vulnerableRatio * (1 - rasioPipPerRentan / 100)

    const tahunNorm = (year - yearMin) / yearRange

    return [
      DATASET_NAME,
      index + 1,
      regionId,
      kecamatan,
      year,

      Math.round(totalPopulation),
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
    ]
  })

  return {
    rows,
    matchedRegionCount,
    unmatchedRegionCount,
    yearMin,
    yearMax,
  }
}

const insertRows = async (rows) => {
  const batchSize = 500
  let inserted = 0

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize)

    const placeholders = batch
      .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .join(', ')

    const values = batch.flat()

    await pool.query(
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
      values
    )

    inserted += batch.length
    console.log(`Imported ${inserted}/${rows.length} rows`)
  }
}

const main = async () => {
  const csvPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : defaultCsvPath

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`)
  }

  await testDatabaseConnection()

  const csvContent = fs.readFileSync(csvPath, 'utf8')

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  if (records.length === 0) {
    throw new Error('CSV is empty.')
  }

  const regionLookup = await getRegionLookup()

  const {
    rows,
    matchedRegionCount,
    unmatchedRegionCount,
    yearMin,
    yearMax,
  } = buildRows({
    records,
    regionLookup,
  })

  await insertRows(rows)

  console.log('AI education indicators import completed.')
  console.log(`Dataset       : ${DATASET_NAME}`)
  console.log(`Rows          : ${rows.length}`)
  console.log(`Year range    : ${yearMin} - ${yearMax}`)
  console.log(`Matched region: ${matchedRegionCount}`)
  console.log(`Unmatched     : ${unmatchedRegionCount}`)
}

main()
  .catch((error) => {
    console.error('Import failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })