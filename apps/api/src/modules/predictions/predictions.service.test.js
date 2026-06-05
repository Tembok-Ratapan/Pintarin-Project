const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

const predictionsRepository = require("./predictions.repository");
const predictionsService = require("./predictions.service");

const originalRepository = { ...predictionsRepository };

afterEach(() => {
  Object.assign(predictionsRepository, originalRepository);
});

test("validatePrediction rejects unsupported actions", async () => {
  await assert.rejects(
    () =>
      predictionsService.validatePrediction({
        predictionId: 10,
        officerId: 2,
        action: "delete",
      }),
    (error) => error.statusCode === 400 && /Invalid action/.test(error.message),
  );
});

test("validatePrediction requires corrected label for override", async () => {
  await assert.rejects(
    () =>
      predictionsService.validatePrediction({
        predictionId: 10,
        officerId: 2,
        action: "override",
      }),
    (error) =>
      error.statusCode === 400 && /corrected_label/.test(error.message),
  );
});

test("validatePrediction trims reason and forwards normalized payload", async () => {
  let validatedPayload;

  predictionsRepository.validatePrediction = async (payload) => {
    validatedPayload = payload;
    return { id: payload.predictionId, final_label: "Rendah" };
  };

  const result = await predictionsService.validatePrediction({
    predictionId: "10",
    officerId: 2,
    action: "approve",
    reason: "  sesuai data lapangan  ",
  });

  assert.deepEqual(validatedPayload, {
    predictionId: 10,
    officerId: 2,
    action: "approve",
    reason: "sesuai data lapangan",
    correctedLabel: null,
  });
  assert.equal(result.action, "approve");
  assert.equal(result.prediction.final_label, "Rendah");
});
