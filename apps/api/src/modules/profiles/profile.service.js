const profileRepository = require("./profile.repository");

const sanitizeText = (value, maxLength = 500) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  return String(value).trim().slice(0, maxLength);
};

const getMyProfile = async (user) => {
  let profile = await profileRepository.getProfileByUserId(user.id);

  if (!profile) {
    await profileRepository.createDefaultProfile(user);
    profile = await profileRepository.getProfileByUserId(user.id);
  }

  return profile;
};

const updateMyProfile = async ({ user, payload }) => {
  let profile = await profileRepository.getProfileByUserId(user.id);

  if (!profile) {
    await profileRepository.createDefaultProfile(user);
  }

  await profileRepository.updateProfileByUserId(user.id, {
    display_name: sanitizeText(payload.display_name, 180),
    organization_name: sanitizeText(payload.organization_name, 180),
    phone: sanitizeText(payload.phone, 40),
    contact_email: sanitizeText(payload.contact_email, 150),
    address: sanitizeText(payload.address, 1000),
    website: sanitizeText(payload.website, 220),
    logo_url: sanitizeText(payload.logo_url, 500),
    description: sanitizeText(payload.description, 1000),
  });

  return profileRepository.getProfileByUserId(user.id);
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};