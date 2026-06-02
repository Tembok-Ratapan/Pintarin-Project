import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export const formatNumber = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID").format(number);
};

export const formatPercent = (value) => {
  const number = Number(value || 0);

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(number)}%`;
};

export const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatCompactCurrency = (value) => {
  const number = Number(value || 0);

  if (Math.abs(number) >= 1_000_000_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(number / 1_000_000_000)} M`;
  }

  if (Math.abs(number) >= 1_000_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(number / 1_000_000)} jt`;
  }

  return formatCurrency(number);
};

export const getRiskBadgeClass = (riskStatus) => {
  if (riskStatus === "Tinggi") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (riskStatus === "Sedang") {
    return "border-yellow-200 bg-yellow-50 text-yellow-800";
  }

  return "border-green-200 bg-green-50 text-green-700";
};

export const getInitials = (value = "") => {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

export const truncateText = (value = "", maxLength = 80) => {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength).trim()}...`;
};
