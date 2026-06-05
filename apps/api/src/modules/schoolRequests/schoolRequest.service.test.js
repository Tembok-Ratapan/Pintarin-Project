const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

const schoolRequestRepository = require("./schoolRequest.repository");
const schoolRequestService = require("./schoolRequest.service");

const originalRepository = { ...schoolRequestRepository };

afterEach(() => {
  Object.assign(schoolRequestRepository, originalRepository);
});

test("school operator request is tied to the school from stakeholder profile", async () => {
  let createdPayload;

  schoolRequestRepository.getSchoolOperatorContext = async () => ({
    school_id: 12,
    profile_region_id: 3,
    school_region_id: 4,
  });
  schoolRequestRepository.createRequest = async (payload) => {
    createdPayload = payload;
    return 99;
  };
  schoolRequestRepository.getRequestById = async (id) => ({
    id,
    school_id: createdPayload.schoolId,
    region_id: createdPayload.regionId,
  });

  const result = await schoolRequestService.createRequest({
    user: { id: 7, role: "school_operator", region_id: 3 },
    payload: {
      title: "Bantuan laptop",
      category: "Laptop",
      urgency: "Tinggi",
      requested_value: 15000000,
    },
  });

  assert.equal(result.school_id, 12);
  assert.equal(result.region_id, 4);
  assert.equal(createdPayload.submittedBy, 7);
});

test("school operator cannot submit for a different profile school", async () => {
  schoolRequestRepository.getSchoolOperatorContext = async () => ({
    school_id: 12,
    profile_region_id: 3,
    school_region_id: 4,
  });
  schoolRequestRepository.createRequest = async () => {
    throw new Error("createRequest should not be called");
  };

  await assert.rejects(
    () =>
      schoolRequestService.createRequest({
        user: { id: 7, role: "school_operator", region_id: 3 },
        payload: {
          school_id: 13,
          title: "Bantuan laptop",
          category: "Laptop",
        },
      }),
    (error) =>
      error.statusCode === 403 && /sekolahnya sendiri/.test(error.message),
  );
});

test("school operator fallback school must stay inside assigned region", async () => {
  schoolRequestRepository.getSchoolOperatorContext = async () => ({
    school_id: null,
    profile_region_id: 3,
    school_region_id: null,
  });
  schoolRequestRepository.getSchoolById = async () => ({
    id: 22,
    region_id: 8,
  });
  schoolRequestRepository.createRequest = async () => {
    throw new Error("createRequest should not be called");
  };

  await assert.rejects(
    () =>
      schoolRequestService.createRequest({
        user: { id: 7, role: "school_operator", region_id: 3 },
        payload: {
          school_id: 22,
          title: "Bantuan internet",
          category: "Internet",
        },
      }),
    (error) => error.statusCode === 403 && /wilayahnya/.test(error.message),
  );
});

test("school operator without profile school uses first school in assigned region", async () => {
  let createdPayload;

  schoolRequestRepository.getSchoolOperatorContext = async () => ({
    school_id: null,
    profile_region_id: 3,
    school_region_id: null,
  });
  schoolRequestRepository.getFirstSchoolByRegion = async (regionId) => {
    assert.equal(regionId, 3);
    return {
      id: 31,
      region_id: 3,
    };
  };
  schoolRequestRepository.getFirstSchool = async () => {
    throw new Error("getFirstSchool should not be called");
  };
  schoolRequestRepository.createRequest = async (payload) => {
    createdPayload = payload;
    return 101;
  };
  schoolRequestRepository.getRequestById = async (id) => ({
    id,
    school_id: createdPayload.schoolId,
    region_id: createdPayload.regionId,
  });

  const result = await schoolRequestService.createRequest({
    user: { id: 7, role: "school_operator", region_id: 3 },
    payload: {
      title: "Bantuan internet",
      category: "Internet",
    },
  });

  assert.equal(result.school_id, 31);
  assert.equal(result.region_id, 3);
  assert.equal(createdPayload.submittedBy, 7);
});
