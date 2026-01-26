import { type ReactNode, useState, useEffect } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<null | UserResponse>(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp > currentTime) {
          return JSON.parse(storedUser);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  });

  //depois terminar e add o setIsLoadingSession
  const [isLoadingSession] = useState(true);

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setSession(null);
  }

  function save(data: UserResponse) {
    setSession(data);
    localStorage.setItem("user", JSON.stringify(data));
  }

  useEffect(() => {}, []);

  return (
    <AuthContext.Provider value={{ session, save, logout, isLoadingSession }}>
      {children}
    </AuthContext.Provider>
  );
}
