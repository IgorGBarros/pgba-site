import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, LogOut, Copy, Check, ExternalLink } from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // Ajuste o caminho se necessário
import { useToast } from "../hooks/use-toast"; // Ajuste o caminho se necessário
import { api } from "../services/api"; // ✅ Importando sua API customizada (Axios)

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Estado do formulário
  const [form, setForm] = useState({
    display_name: "",
    whatsapp_number: "",
    storefront_enabled: false,
    slug: "" // Adicionado para a vitrine
  });

  // 1. Carregar dados da Loja (Django API)
  useEffect(() => {
    // Se não tiver usuário logado, o useAuth deve tratar, mas evitamos chamadas aqui
    if (!user) return;

    const fetchStoreSettings = async () => {
      try {
        // GET /store/settings/ -> Retorna os dados da Store vinculada ao User
        const { data } = await api.get("/settings/");
        
        setForm({
          display_name: data.name || "",        // Mapeia 'name' do Django para 'display_name'
          whatsapp_number: data.whatsapp || "", // Mapeia 'whatsapp'
          storefront_enabled: true,             // MVP: Assumindo ativo se a loja existe
          slug: data.slug || ""                 // Slug para o link da vitrine
        });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast({ 
          title: "Atenção", 
          description: "Não foi possível carregar os dados da loja.",
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreSettings();
  }, [user, toast]);

  // 2. Salvar dados (Django API)
  const handleSave = async () => {
    setSaving(true);
    try {
      // PATCH /store/settings/ -> Atualiza os dados
      await api.patch("/settings/", {
        name: form.display_name,
        whatsapp: form.whatsapp_number,
        // storefront_enabled: form.storefront_enabled // Enviar se o backend suportar
      });

      toast({ title: "Sucesso!", description: "Configurações salvas!" });
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Falha ao salvar.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // URL da Vitrine baseada no SLUG da loja (vinda do backend)
  // Se não tiver slug, usa o ID do usuário como fallback
  const storeIdentifier = form.slug || user?.id; 
  const storefrontUrl = `${window.location.origin}/vitrine/${storeIdentifier}`;

  const copyLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    toast({ title: "Link copiado!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await signOut(); // O useAuth deve limpar o token do localStorage
    navigate("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-6 py-4">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Configurações</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-6 space-y-5">
        {/* Profile / Store Settings */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground">Dados da Loja</h2>
          
          <div>
            <label className="text-sm text-muted-foreground">Nome da Loja</label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
              placeholder="Ex: Consultoria da Maria"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">WhatsApp (com DDD)</label>
            <input
              type="tel"
              value={form.whatsapp_number}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp_number: e.target.value }))}
              placeholder="5511999999999"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Usado para clientes enviarem pedidos da vitrine.
            </p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email da Conta</label>
            {/* Exibe o email vindo do hook useAuth ou do User object */}
            <p className="mt-1 text-sm text-foreground font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Storefront / Vitrine */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground">Vitrine Digital</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Status da Vitrine</p>
              <p className="text-xs text-muted-foreground">Permite que clientes vejam seu estoque</p>
            </div>
            
            <button
              onClick={() => setForm((p) => ({ ...p, storefront_enabled: !p.storefront_enabled }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.storefront_enabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.storefront_enabled ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          {form.storefront_enabled && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs text-muted-foreground">Link para compartilhar:</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={storefrontUrl}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono text-muted-foreground outline-none select-all"
                />
                <button onClick={copyLink} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-secondary/80">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
                <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-secondary/80">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 hover:border-destructive/50"
        >
          <LogOut className="h-4 w-4" />
          Sair da Conta
        </button>
      </main>
    </div>
  );
}