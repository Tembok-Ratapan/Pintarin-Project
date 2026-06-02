const assert = require("node:assert/strict");
const { test } = require("node:test");

const env = require("../../config/env");
const genAiService = require("./genAi.service");

test("gen ai rejects very short prompts", async () => {
  await assert.rejects(
    () => genAiService.askGemini({ message: "hi" }),
    (error) => {
      assert.equal(error.statusCode, 400);
      return true;
    },
  );
});

test("gen ai reports missing gemini api key", async () => {
  const originalApiKey = env.genAi.geminiApiKey;

  env.genAi.geminiApiKey = "";

  try {
    await assert.rejects(
      () => genAiService.askGemini({ message: "Beri rekomendasi bantuan." }),
      (error) => {
        assert.equal(error.statusCode, 503);
        return true;
      },
    );
  } finally {
    env.genAi.geminiApiKey = originalApiKey;
  }
});
