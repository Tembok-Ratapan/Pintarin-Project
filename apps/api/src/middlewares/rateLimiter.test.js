const assert = require("node:assert/strict");
const test = require("node:test");

const { createRateLimiter } = require("./rateLimiter");

const createMockResponse = () => {
  const headers = {};

  return {
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
  };
};

test("rate limiter allows requests below the limit", () => {
  const limiter = createRateLimiter({
    windowMs: 1000,
    max: 2,
    keyGenerator: () => "client-a",
  });

  const req = {};
  const firstResponse = createMockResponse();
  const secondResponse = createMockResponse();
  let nextCalls = 0;

  limiter(req, firstResponse, () => {
    nextCalls += 1;
  });

  limiter(req, secondResponse, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(firstResponse.getHeader("X-RateLimit-Limit"), "2");
  assert.equal(secondResponse.getHeader("X-RateLimit-Remaining"), "0");
});

test("rate limiter blocks requests above the limit", () => {
  const limiter = createRateLimiter({
    windowMs: 1000,
    max: 1,
    keyGenerator: () => "client-b",
    message: "blocked",
  });

  const req = {};
  const allowedResponse = createMockResponse();
  const blockedResponse = createMockResponse();
  let nextCalls = 0;

  limiter(req, allowedResponse, () => {
    nextCalls += 1;
  });

  limiter(req, blockedResponse, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 1);
  assert.equal(blockedResponse.statusCode, 429);
  assert.equal(blockedResponse.body.success, false);
  assert.equal(blockedResponse.body.message, "blocked");
  assert.equal(blockedResponse.getHeader("Retry-After"), "1");
});
