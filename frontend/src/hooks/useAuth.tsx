import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api"; // Sua instância do Axios configurada
import { jwtDecode } from "jwt-decode"; // Opcional: Para ler dados do token (instalar: npm install jwt-decode)

// Interface do Usuário (Baseada no CustomUser/User do Django)
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
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ao iniciar, verifica se existe token salvo
    const loadStorageData = async () => {
      const storedToken = localStorage.getItem("@NaturaStock:token");
      const storedUser = localStorage.getItem("@NaturaStock:user");

      if (storedToken && storedUser) {
        // Configura o token no cabeçalho padrão do Axios
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // 2. Faz o POST para o Django (Endpoint configurado no urls.py)
      const response = await api.post("/auth/login/", {
        username: email, // O Django espera 'username' (mesmo sendo email na lógica)
        password: password,
      });

      const { access, refresh } = response.data;

      // 3. Tenta extrair dados do usuário do token (se usar claims customizados)
      // Ou usa os dados básicos se o backend não retornar o objeto user
      let userData: User = { 
        id: 0, 
        email: email, 
        name: "Usuário" 
      };

      try {
        // Se instalou jwt-decode: const decoded: any = jwtDecode(access);
        // userData = { id: decoded.user_id, email: decoded.email, name: decoded.name };
        
        // Se o seu serializer CustomTokenObtainPairSerializer retornar o user, use-o aqui
        // Por enquanto, vamos simular com o email
      } catch (e) {
        console.log("Erro ao decodificar token");
      }

      // 4. Salva no localStorage
      localStorage.setItem("@NaturaStock:token", access);
      localStorage.setItem("@NaturaStock:refresh", refresh);
      localStorage.setItem("@NaturaStock:user", JSON.stringify(userData));

      // 5. Atualiza o Axios e o Estado
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      setUser(userData);

    } catch (error) {
      console.error("Erro no login:", error);
      throw error; // Lança o erro para a tela de login tratar
    }
  };

  const signOut = () => {
    localStorage.removeItem("@NaturaStock:token");
    localStorage.removeItem("@NaturaStock:refresh");
    localStorage.removeItem("@NaturaStock:user");
    
    // Remove o header
    delete api.defaults.headers.common["Authorization"];
    
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signIn, 
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