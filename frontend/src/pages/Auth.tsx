import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // ✅ Hook de Autenticação Customizado
import { api } from "../services/api"; // ✅ API Axios
import { useToast } from "../hooks/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn } = useAuth(); // Pega a função de login do contexto
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN (Via useAuth / JWT) ---
        await signIn(email, password);
        navigate("/"); 
      } else {
        // --- CADASTRO (Via API Direta) ---
        // Certifique-se de ter a rota '/auth/register/' no seu Django urls.py
        // apontando para uma CreateAPIView com o UserSerializer.
        await api.post("/auth/register/", {
          username: email, // Django requer username (usamos o email)
          email: email,
          password: password,
          first_name: name, 
        });

        toast({
          title: "Conta criada com sucesso!",
          description: "Faça login para continuar.",
        });
        setIsLogin(true); // Muda para a tela de login
      }
    } catch (err: any) {
      console.error(err);
      
      // Tratamento de erros comuns
      let msg = "Falha na autenticação.";
      if (err.response) {
        // Erro vindo do Backend (400, 401, etc)
        if (err.response.status === 401) msg = "Credenciais inválidas.";
        else if (err.response.data?.detail) msg = err.response.data.detail;
        else if (err.response.data?.username) msg = "Este usuário já existe.";
        else msg = JSON.stringify(err.response.data); // Debug rápido
      } else if (err.message) {
        msg = err.message; // Erro de conexão (Network Error)
      }

      toast({
        title: "Erro",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Como a integração backend com Firebase/Google está pendente
    toast({ 
      title: "Em breve", 
      description: "Login social estará disponível nas próximas atualizações.",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Estoque Natura</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        {/* Google Button (Visual) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-shadow hover:shadow-md active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Entrar com Google
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required={!isLogin}
                className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              minLength={6}
              className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary hover:underline"
          >
            {isLogin ? "Criar conta" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
}