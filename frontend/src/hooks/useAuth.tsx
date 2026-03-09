import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, AuthUser, setToken, clearToken } from "../lib/api";
import { getFirebaseAuth, getGoogleProvider } from "../lib/firebase";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signInDemo: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const res = await authApi.register(email, password, name);
    setToken(res.token);
    setUser(res.user);
  };

  const signInWithGoogle = async () => {
    const firebaseAuth = getFirebaseAuth();
    const googleProvider = getGoogleProvider();
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await result.user.getIdToken();
    const res = await authApi.firebaseLogin(idToken);
    setToken(res.token);
    setUser(res.user);
  };

  const signInDemo = () => {
    const demoUser: AuthUser = { id: "demo", email: "teste@natura.com", name: "Usuário Teste" };
    setToken("demo-token");
    setUser(demoUser);
  };

  const signOut = async () => {
    await authApi.logout().catch(() => {});
    clearToken();
    try {
      const firebaseAuth = getFirebaseAuth();
      await firebaseSignOut(firebaseAuth);
    } catch {
      // Firebase not initialized, ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signInDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
