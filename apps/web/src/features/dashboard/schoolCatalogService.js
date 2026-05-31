import api from "../../lib/api";

const normalizeSchoolsPayload = (payload) => {
  const data = payload?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.schools)) {
    return data.schools;
  }

  return [];
};

export const schoolCatalogService = {
  async getSchools({ search, regionId, limit = 80, signal } = {}) {
    const response = await api.get("/schools", {
      params: {
        search: search || undefined,
        region_id: regionId || undefined,
        limit,
      },
      signal,
    });

    return normalizeSchoolsPayload(response.data);
  },
};