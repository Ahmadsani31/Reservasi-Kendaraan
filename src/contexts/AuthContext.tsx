import React, { createContext, useState, useContext, useEffect } from "react";

import { cekLogin, loginApi } from "../api/auth";
import { AuthResponse, LoginData, User } from "../types/auth";
import axios from "axios";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    // const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    // setIsAuthenticated(loggedIn);

    // const isToken = localStorage.getItem('authToken');
    // if (isToken) {
    //     setIsAuthenticated(true);
    // }
    if (token) {
      checkLogin();
    }
  }, [token]);

  const checkLogin = async () => {
    const isToken = localStorage.getItem("authToken");
    if (isToken) {
      // setIsAuthenticated(true);
      try {
        const res = await cekLogin(isToken);
        // console.log(res);
        // console.log(res.data);
        // setUser(res.data.user);
        // setToken(res.data.token);
        // setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setIsAuthenticated(false);
        console.log(err);
      }
    }
  };

  const login = async (data: LoginData): Promise<Boolean> => {
    // console.log(data);

    setLoading(true);
    setError(null);
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
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // const login = (email: string, password: string): boolean => {
  //     // Simple authentication logic
  //     if (email === 'admin@example.com' && password === 'password') {
  //         localStorage.setItem('isLoggedIn', 'true');
  //         setIsAuthenticated(true);
  //         return true;
  //     }
  //     return false;
  // };

  // const login = async (email: string, password: string) => {
  //     // Simple authentication logic
  //     try {
  //         setLoading(true);
  //         setError(null);
  //         // Simulate an API call
  //         const isValidUser = await fakeApiCall(email, password);
  //         if (isValidUser) {
  //             localStorage.setItem('authToken', 'fakeToken123');
  //             setToken('fakeToken123');
  //             return true;
  //         } else {
  //             setError('Invalid email or password');
  //             return false;
  //         }
  //     }
  //     catch (err) {
  //         setError('An error occurred during login');
  //         return false;
  //     } finally {
  //         setLoading(false);
  //     }
  //     if (email === 'admin@example.com' && password === 'password') {
  //         localStorage.setItem('isLoggedIn', 'true');
  //         setIsAuthenticated(true);
  //         return true;
  //     }
  //     return false;
  // };

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
