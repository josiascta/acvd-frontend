import { type ReactNode, useState, useEffect } from "react";
import { jwtDecode, type JwtPayload } from "jwt-decode"; 
import { AuthContext } from "./AuthContext";

// SOLUÇÃO PARA ts(2306): 
// Use 'import type' para indicar que você quer apenas a definição da interface.
// Remova a extensão '.d' do caminho.
import type { UserResponse } from "../dtos/user"; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserResponse | null>(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        // Tipagem correta para o jwtDecode evitar o erro de 'any'
        const decoded = jwtDecode<JwtPayload>(token); 
        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp > currentTime) {
          // 'as UserResponse' garante que o JSON parseado bata com o tipo importado
          return JSON.parse(storedUser) as UserResponse;
        }
      } catch (error) {
        console.error("Erro na validação do token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    
    // IMPORTANTE: Removida a limpeza automática que causava o 404 no F5.
    // Agora o código só retorna null, sem apagar os dados se o if falhar momentaneamente.
    return null;
  });

  const [isLoadingSession] = useState(false);

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setSession(null);
  }

  function save(data: UserResponse) {
    setSession(data);
    localStorage.setItem("user", JSON.stringify(data));
  }

  useEffect(() => {
    // Espaço para lógica futura
  }, []);

  return (
    <AuthContext.Provider value={{ session, save, logout, isLoadingSession }}>
      {children}
    </AuthContext.Provider>
  );
}