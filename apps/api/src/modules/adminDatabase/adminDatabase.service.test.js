const assert = require("node:assert/strict");
const { test } = require("node:test");

const adminDatabaseService = require("./adminDatabase.service");
const { tableRegistry } = require("./adminDatabase.registry");

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

test("admin database registry excludes removed legacy tables", () => {
  const removedTables = [
    "population_education_records",
    "risk_records",
    "csr_programs",
  ];

  for (const tableName of removedTables) {
    assert.equal(tableRegistry[tableName], undefined);
  }
});

test("admin database keeps AI generated tables read-only", () => {
  const readOnlyAiTables = [
    "predictions",
    "analytics_snapshots",
    "education_indicators",
    "prediction_validations",
    "csr_match_logs",
    "audit_logs",
  ];

  for (const tableName of readOnlyAiTables) {
    assert.equal(tableRegistry[tableName].canCreate, false);
    assert.equal(tableRegistry[tableName].canUpdate, false);
    assert.equal(tableRegistry[tableName].canDelete, false);
  }
});
