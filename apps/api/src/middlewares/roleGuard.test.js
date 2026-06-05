const assert = require("node:assert/strict");
const { test } = require("node:test");

const roleGuard = require("./roleGuard");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("roleGuard allows admin as privileged override", () => {
  const req = { user: { role: "admin" } };
  const res = createResponse();
  let calledNext = false;

  roleGuard(["officer"])(req, res, () => {
    calledNext = true;
  });

  assert.equal(calledNext, true);
  assert.equal(res.statusCode, null);
});

test("roleGuard rejects users outside allowed roles", () => {
  const req = { user: { role: "viewer" } };
  const res = createResponse();
  let calledNext = false;

  roleGuard(["officer"])(req, res, () => {
    calledNext = true;
  });

  assert.equal(calledNext, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("roleGuard rejects requests without authenticated role", () => {
  const req = { user: {} };
  const res = createResponse();
  let calledNext = false;

  roleGuard(["viewer"])(req, res, () => {
    calledNext = true;
  });

  assert.equal(calledNext, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
});
