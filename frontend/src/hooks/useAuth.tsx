// src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";

// Interface básica do Usuário baseada no retorno do backend
export interface User {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário da sessão ao iniciar
  useEffect(() => {
    const loadStorageData = () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        api.defaults.headers.common["Authorization"] = `Token ${storedToken}`; // Ou Bearer, depende do seu DRF
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  // Login normal
  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login/", { username: email, password });
      // Ajuste as chaves de acordo com o que seu DRF retorna (ex: access, refresh ou token)
      const { access, user: userData } = response.data;

      localStorage.setItem("auth_token", access);
      localStorage.setItem("auth_user", JSON.stringify(userData || { email }));

      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      setUser(userData || { email });
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
      // Implementação de cadastro (geralmente chama API e depois loga)
      await api.post("/auth/register/", { username: email, email, password, first_name: name });
  };

  // ✅ NOVO: Login com Google via Firebase -> Django
  const signInWithGoogle = async () => {
    try {
      // 1. Abre o popup do Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Pega o ID Token gerado
      const idToken = await result.user.getIdToken();

      // 3. Envia o token para o Django validar e retornar um JWT do seu sistema
      const response = await api.post("/auth/firebase/", { token: idToken });
      
      // 4. Salva a sessão no frontend (supondo que o Django retorne 'token' ou 'access')
      const token = response.data.access || response.data.token;
      const userData = { email: response.data.email, name: response.data.name };

      if (token) {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("auth_user", JSON.stringify(userData));
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(userData as User);
      } else {
          throw new Error("Token não retornado pelo servidor.");
      }

    } catch (error) {
      console.error("Erro no login com Google:", error);
      throw error;
    }
  };

  const signInDemo = () => {
      const demoUser = { id: 999, email: "demo@natura.com", name: "Consultora Demo" };
      setUser(demoUser);
      localStorage.setItem("auth_user", JSON.stringify(demoUser));
      localStorage.setItem("auth_token", "demo_token");
      // Adicione override para plano PRO se aplicável
  };

  const signOut = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    // Tenta deslogar do firebase também
    try { await auth.signOut(); } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInDemo,
        signOut,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};