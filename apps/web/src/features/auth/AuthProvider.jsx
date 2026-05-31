import { useCallback, useMemo, useState } from "react";

import { authStorage } from "../../lib/authStorage";
import { AuthContext } from "./AuthContext";
import { authService } from "./authService";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getUser());
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(user && authStorage.getToken());

  const refreshUser = useCallback(async () => {
    const token = authStorage.getToken();

    if (!token) {
      authStorage.clear();
      setUser(null);
      return null;
    }

    try {
      setIsLoading(true);
      const authenticatedUser = await authService.getMe();
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch {
      authStorage.clear();
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, isAuthenticated, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
