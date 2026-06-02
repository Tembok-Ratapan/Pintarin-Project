const axios = require("axios");

const env = require("../../config/env");

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 1800;

const sanitizeText = (value) => {
  return String(value || "").trim();
};

const compactContext = (context) => {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    return "";
  }

  const serialized = JSON.stringify(context, null, 2);

  if (serialized.length <= MAX_CONTEXT_LENGTH) {
    return serialized;
  }

  return `${serialized.slice(0, MAX_CONTEXT_LENGTH)}...`;
};

const buildPrompt = ({ message, context, user }) => {
  const contextText = compactContext(context);
  const userRole = sanitizeText(user?.role) || "unknown";

  return `
Kamu adalah AI Assistant Pintarin untuk Pemerintah Kota Bandung.
Tugasmu membantu analisis risiko pendidikan, bantuan PIP, prioritas kecamatan,
dan rekomendasi kebijakan berbasis data.

Aturan jawaban:
- Jawab dalam bahasa Indonesia.
- Ringkas, padat, dan gunakan poin-poin.
- Jangan mengarang angka jika data tidak diberikan.
- Jika data konteks tidak cukup, sebutkan data apa yang perlu ditambahkan.
- Ingatkan bahwa hasil AI tetap perlu review manusia.

Role pengguna: ${userRole}
${contextText ? `Konteks aplikasi:\n${contextText}` : ""}

User: ${message}
`.trim();
};

const extractReply = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

const askGemini = async ({ message, context, user }) => {
  const cleanMessage = sanitizeText(message);

  if (cleanMessage.length < 3) {
    const error = new Error("Pertanyaan Gen AI minimal 3 karakter.");
    error.statusCode = 400;
    throw error;
  }

  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    const error = new Error(
      `Pertanyaan Gen AI maksimal ${MAX_MESSAGE_LENGTH} karakter.`,
    );
    error.statusCode = 400;
    throw error;
  }

  if (!env.genAi.geminiApiKey) {
    const error = new Error(
      "Gen AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di environment backend.",
    );
    error.statusCode = 503;
    throw error;
  }

  const prompt = buildPrompt({
    message: cleanMessage,
    context,
    user,
  });

  const url = `${env.genAi.apiBaseUrl}/${env.genAi.modelName}:generateContent`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: env.genAi.temperature,
          maxOutputTokens: env.genAi.maxOutputTokens,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.genAi.geminiApiKey,
        },
        timeout: env.genAi.timeoutMs,
      },
    );

    const reply = extractReply(response.data);

    if (!reply) {
      const error = new Error("Gemini tidak mengembalikan jawaban yang valid.");
      error.statusCode = 502;
      throw error;
    }

    return {
      reply,
      model: env.genAi.modelName,
      review_notice: "Hasil Gen AI wajib direview manusia sebelum dipakai.",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const normalizedError = new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Gagal menghubungi Gemini.",
    );
    normalizedError.statusCode = error.response?.status || 502;
    throw normalizedError;
  }
};

module.exports = {
  askGemini,
};
