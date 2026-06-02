import api from "../../lib/api";

export const genAiService = {
  async chat({ message, context }, signal) {
    const response = await api.post(
      "/gen-ai/chat",
      {
        message,
        context,
      },
      { signal },
    );

    return response.data?.data;
  },
};
