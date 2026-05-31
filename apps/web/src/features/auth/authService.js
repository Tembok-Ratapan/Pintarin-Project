import api from "../../lib/api";
import { authStorage } from "../../lib/authStorage";

export const authService = {
  async login({ identifier, password }) {
    const response = await api.post("/auth/login", {
      identifier,
      password,
    });

    const data = response.data?.data;
    const token = data?.token;
    const user = data?.user;

    if (!token || !user) {
      throw new Error("Response login tidak valid dari server.");
    }

    authStorage.setToken(token);
    authStorage.setUser(user);

    return {
      token,
      user,
    };
  },

  async getMe() {
    const response = await api.get("/auth/me");
    const user = response.data?.data;

    if (user) {
      authStorage.setUser(user);
    }

    return user;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      authStorage.clear();
    }
  },
};