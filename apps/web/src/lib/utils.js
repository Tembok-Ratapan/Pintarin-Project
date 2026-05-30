import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs) => {
  return twMerge(clsx(inputs))
}

export const formatNumber = (value) => {
  const number = Number(value || 0)

  return new Intl.NumberFormat('id-ID').format(number)
}

export const formatCurrency = (value) => {
  const number = Number(value || 0)

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number)
}

export const formatPercent = (value, digits = 1) => {
  const number = Number(value || 0)

  return `${number.toFixed(digits)}%`
}

export const getRiskBadgeClass = (riskStatus) => {
  if (riskStatus === 'Tinggi') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (riskStatus === 'Sedang') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}