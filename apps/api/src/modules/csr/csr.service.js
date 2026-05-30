const csrRepository = require('./csr.repository')

const VALID_FOCUS_AREAS = [
  'umum',
  'infrastruktur_sd',
  'beasiswa',
  'angka_putus_sekolah',
]

const VALID_BUDGET_RANGES = [
  'semua',
  'kecil',
  'sedang',
  'besar',
]

const normalizeFocusArea = (value) => {
  return VALID_FOCUS_AREAS.includes(value) ? value : 'umum'
}

const normalizeBudgetRange = (value) => {
  return VALID_BUDGET_RANGES.includes(value) ? value : 'semua'
}

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const getDominantPredictionLabel = (candidate) => {
  const high = normalizeNumber(candidate.high_prediction_count)
  const medium = normalizeNumber(candidate.medium_prediction_count)
  const low = normalizeNumber(candidate.low_prediction_count)

  if (high >= medium && high >= low) return 'Tinggi'
  if (medium >= high && medium >= low) return 'Sedang'
  return 'Rendah'
}

const buildReason = (candidate, focusArea) => {
  const reasons = []

  const riskStatus = candidate.risk_status
  const sdCount = normalizeNumber(candidate.sd_count)
  const pipCoverage = normalizeNumber(candidate.pip_coverage_pct)
  const vulnerablePopulation = normalizeNumber(candidate.total_vulnerable_population)
  const predictedScore = normalizeNumber(candidate.predicted_score)

  if (riskStatus === 'Tinggi') {
    reasons.push(`Status risiko wilayah tinggi`)
  }

  if (predictedScore >= 75) {
    reasons.push(`Skor prediksi AI tinggi (${predictedScore.toFixed(1)})`)
  }

  if (vulnerablePopulation >= 25000) {
    reasons.push(`Jumlah warga rentan besar (${Math.round(vulnerablePopulation).toLocaleString('id-ID')})`)
  }

  if (pipCoverage < 10) {
    reasons.push(`Coverage PIP masih rendah (${pipCoverage.toFixed(1)}%)`)
  }

  if (sdCount < 15) {
    reasons.push(`Jumlah SD relatif terbatas (${sdCount.toFixed(0)} sekolah)`)
  }

  if (focusArea === 'infrastruktur_sd') {
    reasons.unshift('Cocok untuk program peningkatan infrastruktur pendidikan dasar')
  }

  if (focusArea === 'beasiswa') {
    reasons.unshift('Cocok untuk program beasiswa/PIP karena gap bantuan masih terlihat')
  }

  if (focusArea === 'angka_putus_sekolah') {
    reasons.unshift('Cocok untuk program pencegahan risiko putus sekolah')
  }

  return reasons.length
    ? reasons.slice(0, 4)
    : ['Kecamatan memiliki kebutuhan pendidikan yang relevan untuk intervensi CSR']
}

const calculateBudgetMultiplier = (candidate, budgetRange) => {
  const vulnerablePopulation = normalizeNumber(candidate.total_vulnerable_population)
  const csrPrograms = normalizeNumber(candidate.total_csr_programs)

  if (budgetRange === 'semua') return 1

  if (budgetRange === 'kecil') {
    if (vulnerablePopulation <= 15000) return 1.12
    if (csrPrograms <= 3) return 1.06
    return 0.96
  }

  if (budgetRange === 'sedang') {
    if (vulnerablePopulation > 15000 && vulnerablePopulation <= 35000) return 1.12
    return 1
  }

  if (budgetRange === 'besar') {
    if (vulnerablePopulation > 30000) return 1.15
    return 0.98
  }

  return 1
}

const calculateMatchScore = (candidate, focusArea, budgetRange) => {
  const predictedScore = normalizeNumber(candidate.predicted_score)
  const vulnerabilityIndex = normalizeNumber(candidate.vulnerability_index)
  const pipCoverage = normalizeNumber(candidate.pip_coverage_pct)
  const sdCount = normalizeNumber(candidate.sd_count)
  const vulnerableRatio = normalizeNumber(candidate.vulnerable_ratio)
  const riskRanking = normalizeNumber(candidate.risk_ranking, 30)

  let score = 0

  score += Math.min(predictedScore, 100) * 0.35
  score += Math.min(vulnerabilityIndex, 100) * 0.25
  score += Math.max(0, 100 - pipCoverage) * 0.15
  score += Math.max(0, 31 - riskRanking) * 0.5
  score += Math.min(vulnerableRatio * 2, 20)

  if (candidate.risk_status === 'Tinggi') score += 10
  if (candidate.risk_status === 'Sedang') score += 5

  if (focusArea === 'infrastruktur_sd') {
    if (sdCount < 10) score += 18
    else if (sdCount < 15) score += 12
    else if (sdCount < 25) score += 6
  }

  if (focusArea === 'beasiswa') {
    if (pipCoverage < 7) score += 20
    else if (pipCoverage < 10) score += 14
    else if (pipCoverage < 15) score += 8
  }

  if (focusArea === 'angka_putus_sekolah') {
    if (candidate.risk_status === 'Tinggi') score += 18
    if (predictedScore >= 75) score += 10
  }

  if (focusArea === 'umum') {
    if (candidate.risk_status === 'Tinggi') score += 8
    if (pipCoverage < 10) score += 6
    if (sdCount < 15) score += 5
  }

  score *= calculateBudgetMultiplier(candidate, budgetRange)

  return Math.max(0, Math.min(Math.round(score), 100))
}

const matchCsrRegions = async ({ focusArea, budgetRange, userId = null }) => {
  const selectedFocusArea = normalizeFocusArea(focusArea)
  const selectedBudgetRange = normalizeBudgetRange(budgetRange)

  const analyticsYear = await csrRepository.getLatestAnalyticsYear()
  const predictionYear = await csrRepository.getLatestPredictionYear()

  if (!analyticsYear || !predictionYear) {
    return {
      focus_area: selectedFocusArea,
      budget_range: selectedBudgetRange,
      analytics_year: analyticsYear,
      prediction_year: predictionYear,
      recommended: [],
    }
  }

  const candidates = await csrRepository.getCsrMatchingCandidates({
    analyticsYear,
    predictionYear,
  })

  const recommended = candidates
    .map((candidate) => {
      const matchScore = calculateMatchScore(candidate, selectedFocusArea, selectedBudgetRange)

      return {
        region_id: candidate.region_id,
        region_code: candidate.region_code,
        region_name: candidate.region_name,
        risk_status: candidate.risk_status,
        dominant_prediction_label: getDominantPredictionLabel(candidate),
        predicted_score: normalizeNumber(candidate.predicted_score),
        match_score: matchScore,
        confidence_score: normalizeNumber(candidate.avg_confidence_score),
        total_vulnerable_population: normalizeNumber(candidate.total_vulnerable_population),
        pip_coverage_pct: normalizeNumber(candidate.pip_coverage_pct),
        sd_count: normalizeNumber(candidate.sd_count),
        risk_ranking: normalizeNumber(candidate.risk_ranking),
        total_csr_programs: normalizeNumber(candidate.total_csr_programs),
        total_csr_value: normalizeNumber(candidate.total_csr_value),
        reasons: buildReason(candidate, selectedFocusArea),
      }
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5)

  const logId = await csrRepository.saveMatchLog({
    userId,
    focusArea: selectedFocusArea,
    budgetRange: selectedBudgetRange,
    results: recommended,
  })

  return {
    log_id: logId,
    focus_area: selectedFocusArea,
    budget_range: selectedBudgetRange,
    analytics_year: analyticsYear,
    prediction_year: predictionYear,
    recommended,
  }
}

module.exports = {
  matchCsrRegions,
}