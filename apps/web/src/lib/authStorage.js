const TOKEN_KEY = "pintarin_token";
const USER_KEY = "pintarin_user";

const getStorage = (storageName) => {
  if (typeof window === "undefined") return null;

  try {
    return window[storageName];
  } catch {
    return null;
  }
};

const getSessionStorage = () => {
  return getStorage("sessionStorage");
};

const getLegacyLocalStorage = () => {
  return getStorage("localStorage");
};

export const authStorage = {
  getToken() {
    return getSessionStorage()?.getItem(TOKEN_KEY) || null;
  },

  setToken(token) {
    getSessionStorage()?.setItem(TOKEN_KEY, token);
    getLegacyLocalStorage()?.removeItem(TOKEN_KEY);
  },

  getUser() {
    const savedUser = getSessionStorage()?.getItem(USER_KEY);

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      getSessionStorage()?.removeItem(USER_KEY);
      return null;
    }
  },

  setUser(user) {
    getSessionStorage()?.setItem(USER_KEY, JSON.stringify(user));
    getLegacyLocalStorage()?.removeItem(USER_KEY);
  },

  clear() {
    getSessionStorage()?.removeItem(TOKEN_KEY);
    getSessionStorage()?.removeItem(USER_KEY);
    getLegacyLocalStorage()?.removeItem(TOKEN_KEY);
    getLegacyLocalStorage()?.removeItem(USER_KEY);
  },
};
