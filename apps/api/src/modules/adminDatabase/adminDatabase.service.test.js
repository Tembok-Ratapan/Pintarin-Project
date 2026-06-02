const assert = require("node:assert/strict");
const { test } = require("node:test");

const adminDatabaseService = require("./adminDatabase.service");

test("admin database exposes whitelisted metadata only", () => {
  const { tables } = adminDatabaseService.listTables();
  const usersTable = tables.find((table) => table.key === "users");

  assert.ok(usersTable);
  assert.equal(usersTable.canCreate, true);
  assert.equal(
    usersTable.fields.some((field) => field.name === "password_hash"),
    false,
  );
  assert.equal(
    usersTable.fields.some((field) => field.name === "password"),
    true,
  );
});

test("admin database rejects invalid json field values", () => {
  assert.throws(
    () =>
      adminDatabaseService.normalizeFieldValue(
        {
          name: "input_features",
          label: "Input Features",
          type: "json",
        },
        "{invalid",
      ),
    /JSON valid/,
  );
});
