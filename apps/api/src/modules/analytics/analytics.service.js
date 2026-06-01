const analyticsRepository = require('./analytics.repository')

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

module.exports = {
  getDashboardSummary,
}