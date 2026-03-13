import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, LogOut, Sun, Moon, Monitor, Bell, Download, Lock } from "lucide-react";
import { profileApi, inventoryApi, movementsApi, InventoryItem, Movement, formatMoney } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../hooks/usePlan";
import { useFeatureGates } from "../hooks/useFeatureGates";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/use-toast";
import UpgradeModal from "../components/UpgradeModal";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isPro } = usePlan();
  const { isLocked } = useFeatureGates();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new_password: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [storefrontEnabled, setStorefrontEnabled] = useState(false);
  
  const [expiryDays, setExpiryDays] = useState(() => {
    return parseInt(localStorage.getItem("expiry_alert_days") || "30", 10);
  });
  
  const [expiryEnabled, setExpiryEnabled] = useState(() => {
    return localStorage.getItem("expiry_alert_enabled") !== "false";
  });
  
  const [notifPrefs, setNotifPrefs] = useState(() => ({
    sales_milestones: localStorage.getItem("notif_sales_milestones") !== "false",
    weekly_insights: localStorage.getItem("notif_weekly_insights") !== "false",
    low_stock: localStorage.getItem("notif_low_stock") !== "false",
    expiry_alerts: localStorage.getItem("expiry_alert_enabled") !== "false",
  }));

  const toggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`notif_${key}`, String(updated[key]));
      if (key === "expiry_alerts") {
        localStorage.setItem("expiry_alert_enabled", String(updated[key]));
        setExpiryEnabled(updated[key]);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!user) return;
    profileApi.get().then((data) => {
      // Carrega o estado atual da vitrine salvo no banco
      setStorefrontEnabled(data.storefront_enabled ?? false);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  // 🚀 CORREÇÃO DO SALVAMENTO DE SETTINGS (Apenas o que pertence a esta página)
  const handleSave = async () => {
    setSaving(true);
    try {
      // Tenta salvar no backend APENAS o estado da vitrine (storefront_enabled)
      await profileApi.update({
        storefront_enabled: storefrontEnabled,
      });

      // Salva preferências locais (navegador)
      localStorage.setItem("expiry_alert_days", String(expiryDays));
      localStorage.setItem("expiry_alert_enabled", String(expiryEnabled));
      
      toast({ title: "Configurações salvas!" });
    } catch (err: any) {
      // Se der erro na nuvem, garante que as configurações locais continuam salvas
      localStorage.setItem("expiry_alert_days", String(expiryDays));
      localStorage.setItem("expiry_alert_enabled", String(expiryEnabled));
      toast({ title: "Aviso", description: "Configurações locais salvas. Erro ao sincronizar vitrine.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // ── Export CSV ──
  const exportCSV = async (type: "inventory" | "movements") => {
    setExporting(true);
    try {
      if (type === "inventory") {
        const items = await inventoryApi.list();
        const header = "Nome,Código de Barras,Categoria,Quantidade,Preço Custo,Preço Venda,Validade\n";
        const rows = items.map((i: InventoryItem) =>
          `"${i.product_name || i.product?.name}","${i.barcode || i.product?.bar_code}","${i.category || i.product?.category}",${i.quantity || i.total_quantity},${i.cost_price},${i.sale_price || ""},${i.expiry_date || ""}`
        ).join("\n");
        downloadFile(header + rows, "estoque.csv");
      } else {
        const items = await movementsApi.list();
        const header = "Data,Produto,Código,Tipo,Quantidade,Preço Unit.,Tipo Saída,Observações\n";
        const rows = items.map((m: Movement) =>
          `"${new Date(m.created_at).toLocaleDateString("pt-BR")}","${m.product_name}","${m.barcode}","${m.movement_type}",${m.quantity},${m.unit_price || ""},"${m.sale_type || ""}","${m.notes || ""}"`
        ).join("\n");
        downloadFile(header + rows, "movimentacoes.csv");
      }
      toast({ title: "Exportado com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao exportar", description: err.message, variant: "destructive" });
    }
    setExporting(false);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast({ title: "A senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com";
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Token ${token}` } : {}) },
        body: JSON.stringify({ current_password: passwordForm.current, new_password: passwordForm.new_password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || "Erro ao alterar senha");
      }
      toast({ title: "Senha alterada com sucesso!" });
      setPasswordForm({ current: "", new_password: "", confirm: "" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setChangingPassword(false);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Claro" },
    { value: "dark" as const, icon: Moon, label: "Escuro" },
    { value: "system" as const, icon: Monitor, label: "Sistema" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-6 py-4">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display text-lg font-bold text-foreground">Configurações</h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-6 py-6 space-y-5">

        {/* Tema */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Sun className="h-4 w-4 text-accent" /> Aparência
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  theme === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <opt.icon className={`h-5 w-5 ${theme === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notificações */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" /> Notificações
          </h2>
          <p className="text-xs text-muted-foreground">Escolha quais notificações deseja receber.</p>
          {[
            { key: "sales_milestones" as const, label: "Metas de Vendas", desc: "Aviso ao atingir metas de faturamento (R$500, R$1.000, etc.)" },
            { key: "weekly_insights" as const, label: "Resumo Semanal", desc: "Produtos mais vendidos da semana" },
            { key: "low_stock" as const, label: "Estoque Baixo", desc: "Alerta quando produtos atingem quantidade mínima" },
            { key: "expiry_alerts" as const, label: "Validade Próxima", desc: "Destaque produtos próximos do vencimento" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${notifPrefs[item.key] ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifPrefs[item.key] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
          {notifPrefs.expiry_alerts && (
            <div>
              <label className="text-sm text-muted-foreground">Alertar quantos dias antes?</label>
              <div className="mt-2 flex items-center gap-3">
                {[7, 15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setExpiryDays(d)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      expiryDays === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vitrine Digital - Toggle */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            Vitrine Digital
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Ativar Vitrine Pública</p>
              <p className="text-xs text-muted-foreground">Clientes poderão ver seus produtos</p>
            </div>
            <button onClick={() => { if (isLocked("storefront")) { setShowUpgrade(true); return; } setStorefrontEnabled(!storefrontEnabled); }} className={`relative h-6 w-11 rounded-full transition-colors ${storefrontEnabled && !isLocked("storefront") ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${storefrontEnabled && !isLocked("storefront") ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Exportar Dados */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Download className="h-4 w-4 text-accent" /> Exportar Dados
          </h2>
          <p className="text-xs text-muted-foreground">Baixe seus dados em formato CSV para backup ou análise.</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => exportCSV("inventory")}
              disabled={exporting}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Estoque
            </button>
            <button
              onClick={() => exportCSV("movements")}
              disabled={exporting}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Movimentações
            </button>
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-accent" /> Alterar Senha
          </h2>
          <div>
            <label className="text-sm text-muted-foreground">Senha Atual</label>
            <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Nova Senha</label>
            <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm(p => ({ ...p, new_password: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirmar Nova Senha</label>
            <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !passwordForm.current || !passwordForm.new_password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
          >
            {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Alterar Senha
          </button>
        </div>

        {/* Salvar */}
        <button onClick={handleSave} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </button>

        {/* Logout */}
        <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5">
          <LogOut className="h-4 w-4" /> Sair da Conta
        </button>
      </main>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Vitrine Digital"
        description="Crie sua loja virtual e venda pelo WhatsApp. Exclusivo PRO."
      />
    </div>
  );
}