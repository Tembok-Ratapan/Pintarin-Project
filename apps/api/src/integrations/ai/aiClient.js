const axios = require('axios')
const env = require('../../config/env')

const aiHttpClient = axios.create({
  baseURL: env.ai.serviceUrl,
  timeout: env.ai.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
})

const getErrorDetail = (error) => {
  const detail = error.response?.data?.detail || error.response?.data?.message

  if (typeof detail === 'string') return detail
  if (detail) return JSON.stringify(detail)

  return error.message || 'Unknown AI service error'
}

const normalizeAiError = (error, fallbackMessage) => {
  const normalizedError = new Error(`${fallbackMessage}: ${getErrorDetail(error)}`)

  normalizedError.statusCode = error.response ? 502 : 503
  normalizedError.originalStatusCode = error.response?.status || null

  return normalizedError
}

const checkAiHealth = async () => {
  try {
    const response = await aiHttpClient.get('/health')
    return response.data
  } catch (error) {
    throw normalizeAiError(error, 'AI service health check failed')
  }
}

const predictOne = async (payload) => {
  try {
    const response = await aiHttpClient.post('/predict-risk', payload)
    return response.data
  } catch (error) {
    throw normalizeAiError(error, 'AI single prediction failed')
  }
}

const predictBatch = async (records) => {
  try {
    const response = await aiHttpClient.post('/predict-batch', {
      records,
    })

    return response.data
  } catch (error) {
    throw normalizeAiError(error, 'AI batch prediction failed')
  }
}

module.exports = {
  checkAiHealth,
  predictOne,
  predictBatch,
}