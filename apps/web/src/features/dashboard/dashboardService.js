import api from "../../lib/api";

export const dashboardService = {
  async getAnalyticsSummary(signal) {
    const response = await api.get("/analytics/summary", { signal });
    return response.data?.data;
  },

  async getRegions(signal) {
    const response = await api.get("/regions", { signal });
    return response.data?.data || [];
  },

  async getLatestPredictions({ limit = 8, signal } = {}) {
    const response = await api.get("/predictions/latest", {
      params: { limit },
      signal,
    });

    return (
      response.data?.data || {
        year: null,
        predictions: [],
      }
    );
  },

  async getPendingReviews({ limit = 6, signal } = {}) {
    const response = await api.get("/predictions/pending-review", {
      params: { limit },
      signal,
    });

    return (
      response.data?.data || {
        count: 0,
        predictions: [],
      }
    );
  },

  async matchCsrRegions({ focusArea, budgetRange }) {
    const response = await api.post("/csr/match", {
      focus_area: focusArea,
      budget_range: budgetRange,
    });

    return response.data?.data;
  },
};
