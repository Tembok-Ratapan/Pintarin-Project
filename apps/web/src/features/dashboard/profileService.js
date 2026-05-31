import api from "../../lib/api";

export const profileService = {
  async getMyProfile(signal) {
    const response = await api.get("/profiles/me", { signal });
    return response.data?.data || null;
  },

  async updateMyProfile(payload) {
    const response = await api.patch("/profiles/me", payload);
    return response.data?.data || null;
  },
};