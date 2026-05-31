import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { refreshAccessToken, setSessionExpiredHandler } from "../services/api";
import { isAccessTokenExpired } from "../utils/tokenUtils";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const storedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (!storedUser) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        if (!cancelled) setUser(userData);

        if (!accessToken || isAccessTokenExpired(accessToken)) {
          await refreshAccessToken();
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((loginResponseData) => {
    const { accessToken, ...userData } = loginResponseData;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

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

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        updateUser,
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
