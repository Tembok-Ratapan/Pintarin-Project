const schoolRepository = require("./school.repository");

const listSchools = async ({ query }) => {
  const schools = await schoolRepository.listSchools({
    search: query.search,
    regionId: query.region_id,
    limit: query.limit,
  });

  return {
    count: schools.length,
    schools,
  };
};

module.exports = {
  listSchools,
};