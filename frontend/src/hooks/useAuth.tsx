import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';
import { api } from '../services/api'; // A sua API Axios configurada
import { auth, googleProvider, signInWithPopup } from '../firebaseConfig';

// --- TIPAGEM ---
export interface User {
  id: string | number;
  email: string;
  name?: string;
  first_name?: string;
  // Campos de assinatura (do seu projeto anterior)
  subscriptionPlan?: string | null;
  subscriptionStatus?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithFirebase: () => Promise<boolean>;
  signInDemo: () => void;
  // Métodos de gerenciamento mantidos da sua estrutura
  updateUser: (user: User) => boolean;
  cancelSubscription: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // --- 1. CARREGAMENTO INICIAL ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');

        if (token && savedUser) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Erro ao restaurar sessão:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // --- 2. LOGIN NORMAL (DJANGO) ---
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("auth/login/", { username: email, password });
      
      // O Django REST SimpleJWT retorna 'access'
      const { access } = response.data;
      const userData: User = { id: email, email, name: email.split('@')[0] };

      localStorage.setItem("auth_token", access);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      
      setCurrentUser(userData);
      return true;
    } catch (error) {
      console.error("Falha no login local:", error);
      return false;
    }
  };

  // --- 3. LOGIN GOOGLE (FIREBASE -> DJANGO) ---
  const loginWithFirebase = async (): Promise<boolean> => {
    try {
      // Abre o popup do Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // Pega o token para enviar ao Django
      const idToken = await result.user.getIdToken(true);

      if (!idToken) throw new Error("Token do Google vazio.");

      // Envia para nossa view FirebaseLoginView no Django
      const response = await api.post("auth/firebase/", { token: idToken });
      
      const token = response.data.access; 
      const userData: User = { 
          id: response.data.email, 
          email: response.data.email, 
          name: response.data.name 
      };

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      setCurrentUser(userData);
      
      toast({
        title: "Login bem-sucedido",
        description: `Bem-vindo(a), ${userData.name}`,
      });
      return true;
      
    } catch (error: any) {
      console.error('Erro no login com Firebase:', error);
      const msg = error.response?.data?.error || "Não foi possível fazer login com o Google.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
      return false;
    }
  };

  // --- 4. LOGOUT ---
  const logout = async (): Promise<void> => {
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    delete api.defaults.headers.common["Authorization"];
    try { await auth.signOut(); } catch (e) {}
  };

  // --- 5. DEMO ---
  const signInDemo = () => {
    const demoUser: User = { id: 'demo', email: "demo@natura.com", name: "Consultora Teste" };
    setCurrentUser(demoUser);
    localStorage.setItem("auth_user", JSON.stringify(demoUser));
    localStorage.setItem("auth_token", "demo_token");
    api.defaults.headers.common["Authorization"] = `Bearer demo_token`;
  };

  // --- 6. FUNÇÕES AUXILIARES (do seu outro projeto) ---
  const updateUser = (user: User): boolean => {
    setCurrentUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return true;
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!currentUser) return false;
    const updatedUser: User = { ...currentUser, subscriptionStatus: 'canceled', subscriptionPlan: null };
    updateUser(updatedUser);
    toast({ title: "Assinatura cancelada", description: "Sua assinatura foi cancelada com sucesso." });
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser,
      loading,
      login, 
      logout,
      loginWithFirebase,
      signInDemo,
      updateUser,
      cancelSubscription,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve estar dentro de AuthProvider');
  return context;
};