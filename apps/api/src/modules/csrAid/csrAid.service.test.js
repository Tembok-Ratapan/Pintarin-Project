const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

const { pool } = require("../../db/connection");
const csrAidRepository = require("./csrAid.repository");
const csrAidService = require("./csrAid.service");

const originalRepository = { ...csrAidRepository };
const originalPoolQuery = pool.query;

afterEach(() => {
  Object.assign(csrAidRepository, originalRepository);
  pool.query = originalPoolQuery;
});

test("csr aid review rejects selesai status from decision makers", async () => {
  csrAidRepository.getAidProposalById = async () => ({
    id: 10,
    allocation_type: "sekolah_tertentu",
    target_school_id: 1,
    target_region_id: 1,
    status: "Disalurkan",
  });
  csrAidRepository.reviewAidProposal = async () => {
    throw new Error("reviewAidProposal should not be called");
  };

  await assert.rejects(
    () =>
      csrAidService.reviewAidProposal({
        user: { id: 2, role: "officer" },
        id: 10,
        payload: {
          status: "Selesai",
        },
      }),
    (error) =>
      error.statusCode === 400 && /Status review tidak valid/.test(error.message),
  );
});

test("school operator CSR aid history is scoped to distributed aid for its school", async () => {
  const calls = [];

  pool.query = async (sql, values = []) => {
    calls.push({ sql, values });

    if (sql.includes("information_schema.COLUMNS")) {
      return [
        [
          { COLUMN_NAME: "final_school_id" },
          { COLUMN_NAME: "status" },
          { COLUMN_NAME: "distributed_at" },
        ],
      ];
    }

    if (sql.includes("FROM stakeholder_profiles")) {
      return [
        [
          {
            school_id: 12,
            profile_region_id: 3,
            school_region_id: 3,
          },
        ],
      ];
    }

    if (sql.includes("FROM csr_aid_proposals cap")) {
      assert.match(sql, /cap\.final_school_id = \?/);
      assert.match(sql, /cap\.status = \?/);
      assert.deepEqual(values.slice(0, -1), [
        "CSR-AID-0001",
        "CSR-AID-0002",
        "CSR-AID-0003",
        12,
        "Disalurkan",
      ]);
      assert.equal(values[values.length - 1], 10);

      return [[]];
    }

    throw new Error(`Unexpected query: ${sql}`);
  };

  const result = await csrAidRepository.listAidProposals({
    user: { id: 7, role: "school_operator" },
    limit: 10,
  });

  assert.deepEqual(result, []);
  assert.equal(calls.length, 3);
});
