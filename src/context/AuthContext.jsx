import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const readResponse = async (response) => {
  const body = await response.text();

  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signup = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setUser(data.user);

      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const login = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Logout failed");
      }

      setUser(null);

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
