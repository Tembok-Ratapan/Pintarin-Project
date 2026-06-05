export const APP_NAME = 'PINTARIN'

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

export const API_BASE_URL =
  trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api')
