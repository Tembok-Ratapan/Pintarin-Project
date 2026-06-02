import api from "../../lib/api";

const normalizeRequestsPayload = (payload) => {
  const data = payload?.data;

  if (Array.isArray(data)) {
    return {
      count: payload?.count || data.length,
      requests: data,
    };
  }

  return {
    count: data?.count || data?.requests?.length || 0,
    requests: Array.isArray(data?.requests) ? data.requests : [],
  };
};

export const schoolRequestService = {
  async getRequests({ status, limit = 20, signal } = {}) {
    const response = await api.get("/school-requests", {
      params: {
        status: status || undefined,
        limit,
      },
      signal,
    });

    return normalizeRequestsPayload(response.data);
  },

  async createRequest(payload) {
    const response = await api.post("/school-requests", payload);
    return response.data?.data || null;
  },

  async updateRequest({ requestId, payload }) {
    const response = await api.put(`/school-requests/${requestId}`, payload);
    return response.data?.data || null;
  },

  async deleteRequest(requestId) {
    const response = await api.delete(`/school-requests/${requestId}`);
    return response.data?.data || null;
  },

  async reviewRequest({ requestId, status, reviewNote }) {
    const response = await api.patch(`/school-requests/${requestId}/review`, {
      status,
      review_note: reviewNote || null,
    });

    return response.data?.data || null;
  },
};
