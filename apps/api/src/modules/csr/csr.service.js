const csrRepository = require('./csr.repository')

const VALID_FOCUS_AREAS = [
  'umum',
  'infrastruktur_sd',
  'beasiswa',
  'angka_putus_sekolah',
]

const VALID_BUDGET_RANGES = ['semua', 'kecil', 'sedang', 'besar']

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

const normalizeConfidencePercent = (value) => {
  const score = normalizeNumber(value)

  return score <= 1 ? score * 100 : score
}

const getRiskWeight = (label) => {
  if (label === 'Tinggi') return 100
  if (label === 'Sedang') return 65
  return 35
}

const buildBudgetFit = (candidate, budgetRange) => {
  const vulnerablePopulation = normalizeNumber(candidate.total_vulnerable_population)
  const priorityScore = normalizeNumber(candidate.priority_score)

  if (budgetRange === 'semua') return 'Cocok untuk berbagai skala anggaran.'

  if (budgetRange === 'kecil') {
    if (vulnerablePopulation <= 15000) {
      return 'Cocok untuk anggaran kecil karena skala kebutuhan masih terfokus.'
    }

    return 'Masih dapat dipilih untuk program kecil, tetapi perlu fokus intervensi yang spesifik.'
  }

  if (budgetRange === 'sedang') {
    if (vulnerablePopulation > 15000 && vulnerablePopulation <= 35000) {
      return 'Cocok untuk anggaran sedang karena kebutuhan wilayah cukup besar namun masih terukur.'
    }

    return 'Cocok untuk anggaran sedang dengan prioritas program yang jelas.'
  }

  if (budgetRange === 'besar') {
    if (priorityScore >= 70 || vulnerablePopulation > 30000) {
      return 'Cocok untuk anggaran besar karena prioritas dan skala kebutuhan tinggi.'
    }

    return 'Dapat dipilih untuk anggaran besar jika program CSR ingin mencakup intervensi luas.'
  }

  return 'Skala anggaran dapat disesuaikan dengan rancangan program CSR.'
}

const buildReason = (candidate, focusArea, budgetRange) => {
  const reasons = []

  const finalLabel = candidate.final_label || candidate.predicted_label
  const predictedScore = normalizeNumber(candidate.predicted_score)
  const priorityScore = normalizeNumber(candidate.priority_score)
  const vulnerablePopulation = normalizeNumber(candidate.total_vulnerable_population)
  const pipCoverage = normalizeNumber(candidate.pip_coverage_pct)
  const sdCount = normalizeNumber(candidate.sd_count)
  const recommendation = candidate.recommendation_text

  if (focusArea === 'infrastruktur_sd') {
    reasons.push('Cocok untuk program peningkatan infrastruktur pendidikan dasar.')
  }

  if (focusArea === 'beasiswa') {
    reasons.push('Cocok untuk program beasiswa/PIP dan bantuan siswa rentan.')
  }

  if (focusArea === 'angka_putus_sekolah') {
    reasons.push('Cocok untuk program pencegahan risiko putus sekolah.')
  }

  if (focusArea === 'umum') {
    reasons.push('Cocok untuk program CSR pendidikan lintas kebutuhan.')
  }

  if (finalLabel === 'Tinggi') {
    reasons.push(`Label risiko final tinggi dengan skor AI ${predictedScore.toFixed(1)}.`)
  } else {
    reasons.push(`Label risiko final ${finalLabel || 'belum tersedia'} dengan skor AI ${predictedScore.toFixed(1)}.`)
  }

  if (priorityScore > 0) {
    reasons.push(`Priority score AI ${priorityScore.toFixed(1)} menunjukkan urgensi intervensi.`)
  }

  if (vulnerablePopulation > 0) {
    reasons.push(`Estimasi warga rentan ${Math.round(vulnerablePopulation).toLocaleString('id-ID')} orang.`)
  }

  if (pipCoverage > 0 && pipCoverage < 15) {
    reasons.push(`Coverage PIP relatif rendah (${pipCoverage.toFixed(1)}%).`)
  }

  if (sdCount > 0 && sdCount < 15) {
    reasons.push(`Jumlah SD relatif terbatas (${sdCount.toFixed(0)} sekolah).`)
  }

  if (recommendation) {
    reasons.push(recommendation)
  }

  reasons.push(buildBudgetFit(candidate, budgetRange))

  return reasons.slice(0, 5)
}

const calculateBudgetMultiplier = (candidate, budgetRange) => {
  const vulnerablePopulation = normalizeNumber(candidate.total_vulnerable_population)
  const priorityScore = normalizeNumber(candidate.priority_score)
  const csrPrograms = normalizeNumber(candidate.total_csr_programs)

  if (budgetRange === 'semua') return 1

  if (budgetRange === 'kecil') {
    if (vulnerablePopulation <= 15000) return 1.1
    if (csrPrograms <= 3) return 1.04
    return 0.94
  }

  if (budgetRange === 'sedang') {
    if (vulnerablePopulation > 15000 && vulnerablePopulation <= 35000) return 1.1
    if (priorityScore >= 60 && priorityScore < 80) return 1.05
    return 1
  }

  if (budgetRange === 'besar') {
    if (priorityScore >= 70) return 1.12
    if (vulnerablePopulation > 30000) return 1.1
    return 0.98
  }

  return 1
}

const calculateMatchScore = (candidate, focusArea, budgetRange) => {
  const finalLabel = candidate.final_label || candidate.predicted_label
  const predictedScore = normalizeNumber(candidate.predicted_score)
  const priorityScore = normalizeNumber(candidate.priority_score)
  const vulnerabilityIndex = normalizeNumber(candidate.vulnerability_index)
  const pipCoverage = normalizeNumber(candidate.pip_coverage_pct)
  const sdCount = normalizeNumber(candidate.sd_count)
  const confidencePercent = normalizeConfidencePercent(candidate.confidence_score)
  const riskWeight = getRiskWeight(finalLabel)

  let score = 0

  score += Math.min(predictedScore, 100) * 0.25
  score += Math.min(priorityScore || predictedScore, 100) * 0.3
  score += Math.min(vulnerabilityIndex, 100) * 0.12
  score += riskWeight * 0.16
  score += Math.max(0, 100 - pipCoverage) * 0.08

  if (confidencePercent >= 85) score += 5
  if (confidencePercent < 70) score -= 4

  if (candidate.needs_human_review && !candidate.is_human_validated) {
    score -= 3
  }

  if (focusArea === 'infrastruktur_sd') {
    if (sdCount > 0 && sdCount < 10) score += 18
    else if (sdCount > 0 && sdCount < 15) score += 12
    else if (sdCount > 0 && sdCount < 25) score += 6
  }

  if (focusArea === 'beasiswa') {
    if (pipCoverage > 0 && pipCoverage < 7) score += 20
    else if (pipCoverage > 0 && pipCoverage < 10) score += 14
    else if (pipCoverage > 0 && pipCoverage < 15) score += 8
  }

  if (focusArea === 'angka_putus_sekolah') {
    if (finalLabel === 'Tinggi') score += 18
    if (predictedScore >= 75) score += 10
    if (priorityScore >= 75) score += 8
  }

  if (focusArea === 'umum') {
    if (finalLabel === 'Tinggi') score += 10
    if (priorityScore >= 70) score += 8
    if (pipCoverage > 0 && pipCoverage < 15) score += 5
  }

  score *= calculateBudgetMultiplier(candidate, budgetRange)

  return Math.max(0, Math.min(Math.round(score), 100))
}

const matchCsrRegions = async ({ focusArea, budgetRange, userId = null }) => {
  const selectedFocusArea = normalizeFocusArea(focusArea)
  const selectedBudgetRange = normalizeBudgetRange(budgetRange)

  const [analyticsYear, predictionMeta] = await Promise.all([
    csrRepository.getLatestAnalyticsYear(),
    csrRepository.getLatestAiPredictionMeta(),
  ])

  if (!predictionMeta?.prediction_year) {
    return {
      focus_area: selectedFocusArea,
      budget_range: selectedBudgetRange,
      analytics_year: analyticsYear,
      prediction_year: null,
      model_version: null,
      recommended: [],
    }
  }

  const candidates = await csrRepository.getCsrMatchingCandidates({
    analyticsYear: analyticsYear || predictionMeta.data_year,
    predictionYear: predictionMeta.prediction_year,
  })

  const recommended = candidates
    .map((candidate) => {
      const matchScore = calculateMatchScore(
        candidate,
        selectedFocusArea,
        selectedBudgetRange,
      )

      return {
        region_id: candidate.region_id,
        region_code: candidate.region_code,
        region_name: candidate.region_name,

        prediction_id: candidate.prediction_id,
        prediction_code: candidate.prediction_code,
        data_year: candidate.data_year,
        prediction_year: candidate.prediction_year,
        model_version: candidate.model_version,
        algorithm: candidate.algorithm,

        risk_status: candidate.risk_status || candidate.final_label,
        dominant_prediction_label: candidate.final_label || candidate.predicted_label,
        predicted_label: candidate.predicted_label,
        final_label: candidate.final_label,
        predicted_score: normalizeNumber(candidate.predicted_score),
        priority_score: normalizeNumber(candidate.priority_score),

        match_score: matchScore,
        confidence_score: normalizeNumber(candidate.confidence_score),
        confidence_percent: normalizeConfidencePercent(candidate.confidence_score),
        confidence_level: candidate.confidence_level,
        needs_human_review: Boolean(candidate.needs_human_review),
        is_human_validated: Boolean(candidate.is_human_validated),

        total_vulnerable_population: normalizeNumber(candidate.total_vulnerable_population),
        pip_coverage_pct: normalizeNumber(candidate.pip_coverage_pct),
        sd_count: normalizeNumber(candidate.sd_count),
        risk_ranking: normalizeNumber(candidate.risk_ranking),
        total_csr_programs: normalizeNumber(candidate.total_csr_programs),
        total_csr_value: normalizeNumber(candidate.total_csr_value),

        recommendation_text: candidate.recommendation_text,
        budget_fit: buildBudgetFit(candidate, selectedBudgetRange),
        reasons: buildReason(candidate, selectedFocusArea, selectedBudgetRange),
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
    analytics_year: analyticsYear || predictionMeta.data_year,
    prediction_year: predictionMeta.prediction_year,
    model_version: predictionMeta.model_version,
    recommended,
  }
}

module.exports = {
  matchCsrRegions,
}