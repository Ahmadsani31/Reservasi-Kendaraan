import React, { createContext, useState, useContext, useEffect } from "react";

import { cekLogin, loginApi } from "../api/auth";
import { AuthResponse, LoginData, User } from "../types/auth";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<Boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const isToken = localStorage.getItem("authToken");
    if (isToken) {
      return true;
    }
    // return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (token) {
      checkLogin();
    }
  }, [token]);

  const checkLogin = async () => {
    const isToken = localStorage.getItem("authToken");
    if (isToken) {
      // setIsAuthenticated(true);
      try {
        await cekLogin(isToken);

      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setIsAuthenticated(false);
      }
    }
  };

  const login = async (data: LoginData): Promise<Boolean> => {

    setLoading(true);
    try {
      const res: AuthResponse = await loginApi(data);

      if (res.status == true) {
        setUser(res.user);
        setToken(res.token);

        localStorage.setItem("authUser", JSON.stringify(res.user));
        localStorage.setItem("authToken", res.token);
        setIsAuthenticated(true);
        return true;
      } else {
        toast.warning(`Something error, can't login to system!`);
        return false;
      }
    } catch (err: any) {
      // alert(JSON.stringify(err));
      const message = err.response?.data?.message || "Login failed";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };


  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
