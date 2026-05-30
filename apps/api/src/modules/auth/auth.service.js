const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const authRepository = require("./auth.repository");

const sanitizeUser = (user) => {
  if (!user) return null;

  const { password_hash, ...safeUser } = user;
  return safeUser;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      user_code: user.user_code,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    },
  );
};

const login = async ({ identifier, password }) => {
  if (!identifier || !password) {
    const error = new Error("Username/email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await authRepository.findUserByIdentifier(identifier.trim());

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("User account is inactive.");
    error.statusCode = 403;
    throw error;
  }

  let isPasswordValid = false;

  try {
    isPasswordValid = await bcrypt.compare(password, user.password_hash);
  } catch {
    isPasswordValid = false;
  }

  if (!isPasswordValid) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  await authRepository.updateLastLogin(user.id);

  const refreshedUser = await authRepository.findUserById(user.id);

  return {
    token: generateToken(user),
    user: sanitizeUser(refreshedUser),
  };
};

const getMe = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};

module.exports = {
  login,
  getMe,
};
