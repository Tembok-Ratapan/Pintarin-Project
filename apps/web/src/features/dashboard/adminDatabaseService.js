import api from "../../lib/api";

const normalizeResponseData = (response) => response.data?.data || {};

export const adminDatabaseService = {
  async getTables(signal) {
    const response = await api.get("/admin/database/tables", { signal });
    return normalizeResponseData(response);
  },

  async listRecords({ tableKey, search = "", page = 1, limit = 20, signal }) {
    const response = await api.get(`/admin/database/${tableKey}`, {
      params: {
        search,
        page,
        limit,
      },
      signal,
    });

    return normalizeResponseData(response);
  },

  async createRecord({ tableKey, payload }) {
    const response = await api.post(`/admin/database/${tableKey}`, payload);
    return normalizeResponseData(response);
  },

  async updateRecord({ tableKey, id, payload }) {
    const response = await api.patch(
      `/admin/database/${tableKey}/${id}`,
      payload,
    );

    return normalizeResponseData(response);
  },

  async deleteRecord({ tableKey, id }) {
    const response = await api.delete(`/admin/database/${tableKey}/${id}`);
    return normalizeResponseData(response);
  },
};
