import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigationOrigin, setNavigationOrigin] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const origin = sessionStorage.getItem("navOrigin");
    
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
        setNavigationOrigin(origin === "internal" ? origin : null);
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);

    const handleBeforeUnload = () => {
      sessionStorage.setItem("navOrigin", "internal");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("navOrigin", "internal");
    setCurrentUser(userData);
    setNavigationOrigin("internal");
  };

  const logout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("navOrigin");
    setCurrentUser(null);
    setNavigationOrigin(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isNavigationValid: navigationOrigin === "internal",
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

