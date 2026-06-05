import api from "../../lib/api";

const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const normalizePredictionPayload = (responseData) => {
  const payload = responseData?.data;

  if (Array.isArray(payload)) {
    return {
      count: responseData?.count || payload.length,
      predictions: payload,
    };
  }

  return {
    count:
      payload?.count ||
      responseData?.count ||
      payload?.predictions?.length ||
      0,
    predictions: normalizeArray(payload?.predictions || payload?.data),
  };
};

export const dashboardService = {
  async getAnalyticsSummary(signal) {
    const response = await api.get("/analytics/summary", { signal });
    return response.data?.data || null;
  },

  async getOfficerOperationalAnalytics({
    range = "month",
    fromDate,
    toDate,
    signal,
  } = {}) {
    const response = await api.get("/analytics/officer/operations", {
      params: {
        range,
        from_date: fromDate,
        to_date: toDate,
      },
      signal,
    });

    return response.data?.data || null;
  },

  async getRegions(signal) {
    const response = await api.get("/regions", { signal });
    return normalizeArray(response.data?.data);
  },

  async getLatestPredictions({ limit = 8, signal } = {}) {
    const response = await api.get("/predictions/latest", {
      params: { limit },
      signal,
    });

    const payload = response.data?.data;

    if (Array.isArray(payload)) {
      return {
        year: null,
        predictions: payload,
      };
    }

    return {
      year: payload?.year || null,
      predictions: normalizeArray(payload?.predictions || payload?.data),
    };
  },

  async getPendingReviews({ limit = 8, signal } = {}) {
    const response = await api.get("/predictions/pending-review", {
      params: { limit },
      signal,
    });

    return normalizePredictionPayload(response.data);
  },

  async validatePrediction({ predictionId, action, correctedLabel, reason }) {
    const response = await api.post(`/predictions/${predictionId}/validate`, {
      action,
      corrected_label: correctedLabel || null,
      reason: reason || null,
    });

    return response.data;
  },

  async matchCsrRegions({ focusArea, budgetRange }) {
    const response = await api.post("/csr/match", {
      focus_area: focusArea,
      budget_range: budgetRange,
    });

    return response.data?.data || response.data;
  },
};
