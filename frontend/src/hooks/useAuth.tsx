import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";

// 1. IMPORTAÇÕES DO FIREBASE
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";

// 2. INTERFACE DO USUÁRIO
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

  // --- CARREGAR SESSÃO INICIAL ---
  useEffect(() => {
    const loadStorageData = () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        // Se tem token, configura o Axios para enviar em todas as requisições
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  // --- LOGIN NORMAL (Email/Senha) ---
  const signIn = async (email: string, password: string) => {
    try {
      // Chama o endpoint CustomTokenObtainPairView
      const response = await api.post("auth/login/", { username: email, password });
      
      const { access } = response.data;
      
      // Cria um usuário básico para a sessão baseado no email
      // (Se seu backend não retornar o objeto user completo no login normal)
      const userData: User = { id: 0, email: email, name: email.split('@')[0] };

      localStorage.setItem("auth_token", access);
      localStorage.setItem("auth_user", JSON.stringify(userData));

      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      setUser(userData);
      
    } catch (error) {
      console.error("Erro no login padrão:", error);
      throw error;
    }
  };

  // --- CADASTRO MANUAL ---
  const signUp = async (email: string, password: string, name: string) => {
      // Chama CustomUserCreateView
      await api.post("auth/register/", { 
          username: email, 
          email: email, 
          password: password, 
          first_name: name 
      });
  };

  // --- LOGIN GOOGLE (Firebase -> Django) ---
  const signInWithGoogle = async () => {
    try {
      // 1. Abre o popup do Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Extrai o Token JWT seguro gerado pelo Google
      const idToken = await result.user.getIdToken(true);

      if (!idToken) {
          throw new Error("Falha ao gerar credencial do Google.");
      }

      // 3. Envia para o Django (FirebaseLoginView que acabamos de simplificar)
      const response = await api.post("auth/firebase/", { token: idToken });
      
      // 4. Recebe a resposta do Django
      const token = response.data.access; 
      
      if (!token) {
          throw new Error("Token de acesso não retornado pelo servidor Django.");
      }

      const userData: User = { 
          id: response.data.id || 0,
          email: response.data.email, 
          name: response.data.name || "Consultora" 
      };

      // 5. Salva no navegador
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      setUser(userData);

    } catch (error: any) {
      console.error("Erro completo Google Sign-In:", error);
      // Se for erro da API, joga a mensagem que veio do Django para a tela
      if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
      }
      throw error;
    }
  };

  // --- LOGIN DE DEMONSTRAÇÃO ---
  const signInDemo = () => {
      const demoUser: User = { id: 999, email: "demo@natura.com", name: "Consultora Teste" };
      setUser(demoUser);
      localStorage.setItem("auth_user", JSON.stringify(demoUser));
      localStorage.setItem("auth_token", "demo_token_123");
      api.defaults.headers.common["Authorization"] = `Bearer demo_token_123`;
  };

  // --- LOGOUT ---
  const signOut = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    
    // Tenta deslogar do firebase localmente para forçar escolha de conta na próxima vez
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