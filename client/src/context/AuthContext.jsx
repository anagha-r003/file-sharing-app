import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { logoutUser } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted JSON in storage — clear it
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback((loginResponseData) => {
    const { accessToken, ...userData } = loginResponseData;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  // ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("accessToken");

      localStorage.removeItem("user");

      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prevUser) => {
      const updatedUser = {
        ...prevUser,
        ...updatedData,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  }, []);

  // ─────────────────────────────────────────────
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user, // { email, firstName, lastName } or null
        login, // (loginResponseData) => void
        logout, // async () => void
        loading, // true while checking localStorage on mount
        isAuthenticated, // boolean — use this in ProtectedRoute
        updateUser, // (updatedData) => void
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth() must be used inside <AuthProvider>. Wrap your app in AuthProvider.",
    );
  }

  return context;
}
