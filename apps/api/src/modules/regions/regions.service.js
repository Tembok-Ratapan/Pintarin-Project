const regionsRepository = require('./regions.repository')

const allowedRiskStatuses = ['Rendah', 'Sedang', 'Tinggi']

const getRegions = async ({ search, riskStatus }) => {
  const normalizedRiskStatus = allowedRiskStatuses.includes(riskStatus) ? riskStatus : ''

  return regionsRepository.getRegions({
    search: search?.trim() || '',
    riskStatus: normalizedRiskStatus,
  })
}

const getRegionById = async (id) => {
  const region = await regionsRepository.getRegionById(id)

  if (!region) {
    const error = new Error('Region not found')
    error.statusCode = 404
    throw error
  }

  return region
}

module.exports = {
  getRegions,
  getRegionById,
}