const analyticsRepository = require('./analytics.repository')

const getDashboardSummary = async () => {
  const latestYear = await analyticsRepository.getLatestAnalyticsYear()

  if (!latestYear) {
    return {
      year: null,
      summary: null,
      top_risk_regions: [],
    }
  }

  const [summary, schoolSummary, predictionSummary, topRiskRegions] = await Promise.all([
    analyticsRepository.getSummary(latestYear),
    analyticsRepository.getSchoolSummary(),
    analyticsRepository.getPredictionSummary(),
    analyticsRepository.getTopRiskRegions(latestYear, 5),
  ])

  return {
    year: latestYear,
    summary: {
      ...summary,
      ...schoolSummary,
      ...predictionSummary,
    },
    top_risk_regions: topRiskRegions,
  }
}

module.exports = {
  getDashboardSummary,
}