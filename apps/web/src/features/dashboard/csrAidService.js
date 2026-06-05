import api from "../../lib/api";

const normalizeAidPayload = (payload) => {
  const data = payload?.data;

  if (Array.isArray(data)) {
    return {
      count: payload?.count || data.length,
      proposals: data,
    };
  }

  return {
    count: data?.count || data?.proposals?.length || 0,
    proposals: Array.isArray(data?.proposals) ? data.proposals : [],
  };
};

export const csrAidService = {
  async getAidProposals({ status, limit = 20, signal } = {}) {
    const response = await api.get("/csr-aid", {
      params: {
        status: status || undefined,
        limit,
      },
      signal,
    });

    return normalizeAidPayload(response.data);
  },

  async createAidProposal(payload) {
    const response = await api.post("/csr-aid", payload);
    return response.data?.data || null;
  },

  async reviewAidProposal({
    proposalId,
    status,
    reviewNote,
    finalSchoolId,
    recommendedSchoolId,
    recommendationNote,
  }) {
    const response = await api.patch(`/csr-aid/${proposalId}/review`, {
      status,
      review_note: reviewNote || null,
      final_school_id: finalSchoolId || null,
      recommended_school_id: recommendedSchoolId || null,
      recommendation_note: recommendationNote || null,
    });

    return response.data?.data || null;
  },

  async decideRecommendation({ proposalId, decision, note }) {
    const response = await api.patch(`/csr-aid/${proposalId}/recommendation`, {
      decision,
      note: note || null,
    });

    return response.data?.data || null;
  },
};
