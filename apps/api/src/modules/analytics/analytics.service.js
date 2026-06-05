const analyticsRepository = require('./analytics.repository')

const padDatePart = (value) => String(value).padStart(2, '0')

const getIsoDate = (date) =>
  [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-')

const getDateKey = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return getIsoDate(new Date(value))
}

const normalizeDays = (range) => {
  const text = String(range || '').trim().toLowerCase()

  if (text === 'week' || text === 'minggu') return 7
  if (text === 'month' || text === 'bulan') return 30

  const parsed = Number.parseInt(text, 10)
  if (!Number.isInteger(parsed)) return 30

  return Math.min(Math.max(parsed, 7), 90)
}

const isIsoDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

const parseDateInput = (value) => {
  if (!isIsoDate(value)) return null

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) return null

  return date
}

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const indexByDate = (rows) =>
  new Map(
    rows.map((row) => [
      getDateKey(row.activity_date),
      row,
    ]),
  )

const buildDateWindow = (days) => {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    dates.push(getIsoDate(date))
  }

  return dates
}

const buildDateRange = (startDate, endDate) => {
  const dates = []
  const cursor = new Date(startDate)

  while (cursor <= endDate) {
    dates.push(getIsoDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

const normalizeDateWindow = ({ range, fromDate, toDate } = {}) => {
  const requestedStart = parseDateInput(fromDate)
  const requestedEnd = parseDateInput(toDate)

  if (requestedStart || requestedEnd) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let start = requestedStart || requestedEnd || today
    let end = requestedEnd || requestedStart || today

    if (start > end) {
      const swapped = start
      start = end
      end = swapped
    }

    const maxDays = 90
    const diffDays = Math.floor((end - start) / 86_400_000) + 1

    if (diffDays > maxDays) {
      start = new Date(end)
      start.setDate(end.getDate() - (maxDays - 1))
    }

    return buildDateRange(start, end)
  }

  return buildDateWindow(normalizeDays(range))
}

const getDashboardSummary = async () => {
  const [latestAnalyticsYear, latestAiPredictionMeta] = await Promise.all([
    analyticsRepository.getLatestAnalyticsYear(),
    analyticsRepository.getLatestAiPredictionMeta(),
  ])

  if (!latestAnalyticsYear && !latestAiPredictionMeta) {
    return {
      year: null,
      prediction_year: null,
      model_version: null,
      algorithm: null,
      summary: null,
      top_risk_regions: [],
    }
  }

  const analyticsYear =
    latestAnalyticsYear || latestAiPredictionMeta?.data_year || null

  const predictionYear = latestAiPredictionMeta?.prediction_year || null

  const [
    summary,
    schoolSummary,
    predictionSummary,
    topRiskRegions,
  ] = await Promise.all([
    analyticsYear
      ? analyticsRepository.getSummary(analyticsYear)
      : Promise.resolve({}),

    analyticsRepository.getSchoolSummary(),

    predictionYear
      ? analyticsRepository.getAiPredictionSummary(predictionYear)
      : analyticsRepository.getLegacyPredictionSummary(),

    predictionYear
      ? analyticsRepository.getAiTopRiskRegions({
          analyticsYear,
          predictionYear,
          limit: 30,
        })
      : analyticsRepository.getTopRiskRegions(analyticsYear, 30),
  ])

  return {
    year: analyticsYear,
    prediction_year: predictionYear,
    model_version: latestAiPredictionMeta?.model_version || null,
    algorithm: latestAiPredictionMeta?.algorithm || null,
    summary: {
      ...summary,
      ...schoolSummary,
      ...predictionSummary,
    },
    top_risk_regions: topRiskRegions,
  }
}

const getOfficerOperationalAnalytics = async ({ range, fromDate, toDate } = {}) => {
  const hasCustomRange = Boolean(parseDateInput(fromDate) || parseDateInput(toDate))
  const dates = normalizeDateWindow({ range, fromDate, toDate })
  const fromDateTime = `${dates[0]} 00:00:00`
  const toDateTime = `${dates[dates.length - 1]} 23:59:59`

  const [
    schoolActivity,
    csrActivity,
    aiValidationActivity,
    schoolStatuses,
    csrStatuses,
  ] = await Promise.all([
    analyticsRepository.getSchoolRequestDailyActivity(fromDateTime, toDateTime),
    analyticsRepository.getCsrProposalDailyActivity(fromDateTime, toDateTime),
    analyticsRepository.getPredictionValidationDailyActivity(fromDateTime, toDateTime),
    analyticsRepository.getSchoolRequestStatusBreakdown(fromDateTime, toDateTime),
    analyticsRepository.getCsrProposalStatusBreakdown(fromDateTime, toDateTime),
  ])

  const schoolByDate = indexByDate(schoolActivity)
  const csrByDate = indexByDate(csrActivity)
  const aiByDate = indexByDate(aiValidationActivity)

  const daily = dates.map((date) => {
    const school = schoolByDate.get(date) || {}
    const csr = csrByDate.get(date) || {}
    const ai = aiByDate.get(date) || {}
    const schoolRequests = toNumber(school.total)
    const csrProposals = toNumber(csr.total)
    const requestValidations =
      toNumber(school.validated) + toNumber(csr.validated)

    return {
      date,
      label: date.slice(5).replace('-', '/'),
      school_requests: schoolRequests,
      csr_proposals: csrProposals,
      total_submissions: schoolRequests + csrProposals,
      request_validations: requestValidations,
      ai_reviews: toNumber(ai.total),
      open_requests: toNumber(school.open_total) + toNumber(csr.open_total),
      aid_value:
        toNumber(school.value_total) + toNumber(csr.value_total),
      approved_ai_reviews: toNumber(ai.approved),
      overridden_ai_reviews: toNumber(ai.overridden),
      flagged_ai_reviews: toNumber(ai.flagged),
    }
  })

  const summary = daily.reduce(
    (acc, item) => ({
      total_submissions: acc.total_submissions + item.total_submissions,
      school_requests: acc.school_requests + item.school_requests,
      csr_proposals: acc.csr_proposals + item.csr_proposals,
      request_validations:
        acc.request_validations + item.request_validations,
      ai_reviews: acc.ai_reviews + item.ai_reviews,
      open_requests: acc.open_requests + item.open_requests,
      aid_value: acc.aid_value + item.aid_value,
    }),
    {
      total_submissions: 0,
      school_requests: 0,
      csr_proposals: 0,
      request_validations: 0,
      ai_reviews: 0,
      open_requests: 0,
      aid_value: 0,
    },
  )

  return {
    range: hasCustomRange ? 'custom' : range || 'month',
    days: dates.length,
    from_date: dates[0],
    to_date: dates[dates.length - 1],
    summary,
    daily,
    status_breakdown: {
      school_requests: schoolStatuses,
      csr_proposals: csrStatuses,
    },
  }
}

module.exports = {
  getDashboardSummary,
  getOfficerOperationalAnalytics,
}
