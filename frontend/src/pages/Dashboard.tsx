import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, TrendingDown, DollarSign, BarChart3, ArrowLeft, AlertTriangle, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../services/api"; // ✅ Importa a API configurada

// Interface ajustada para manipulação interna do Dashboard
interface DashboardItem {
  id: number;
  product_name: string;
  category: string;
  quantity: number;
  cost_price: number;
  sale_price: number | null;
  min_quantity: number;
  expiry_date: string | null;
}

// Cores para os gráficos
const COLORS = [
  "hsl(152, 55%, 28%)", "hsl(38, 80%, 55%)", "hsl(200, 60%, 50%)",
  "hsl(280, 50%, 55%)", "hsl(350, 60%, 55%)", "hsl(160, 45%, 45%)",
  "hsl(30, 70%, 50%)", "hsl(220, 55%, 55%)",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CARREGAMENTO DE DADOS (API) ---
  useEffect(() => {
    async function fetchInventory() {
      try {
        const { data } = await api.get("/inventory/");
        
        // Mapeia a resposta da API (Aninhada) para o Estado do Dashboard (Plano)
        const mappedData: DashboardItem[] = data.map((item: any) => {
          
          // Lógica para pegar a validade mais próxima (FIFO)
          // Filtra lotes com qtd > 0 e ordena por data
          const activeBatches = item.batches
            ?.filter((b: any) => b.quantity > 0 && b.expiration_date)
            .sort((a: any, b: any) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());
          
          const nextExpiry = activeBatches?.[0]?.expiration_date || null;

          return {
            id: item.id,
            product_name: item.product.name,
            category: item.product.category || "Geral",
            quantity: item.total_quantity,
            cost_price: Number(item.cost_price),
            sale_price: Number(item.sale_price),
            min_quantity: item.min_quantity,
            expiry_date: nextExpiry
          };
        });

        setItems(mappedData);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  // --- CÁLCULOS DOS INDICADORES ---
  const totalProducts = items.length;
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const totalValue = items.reduce((s, i) => s + (i.quantity * i.cost_price), 0);
  
  // Filtro de Estoque Baixo
  const lowStock = items.filter((i) => i.quantity <= i.min_quantity); // Removi i.quantity > 0 para mostrar também os zerados
  
  // Filtro de Validade (Próximos 3 meses)
  const today = new Date();
  const soon = new Date(today);
  soon.setMonth(soon.getMonth() + 3);
  
  const expiringSoon = items.filter((i) => {
    if (!i.expiry_date) return false;
    const d = new Date(i.expiry_date);
    // Vence no futuro próximo OU já venceu (d < today)
    return d <= soon; 
  }).sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());

  // --- DADOS PARA GRÁFICOS ---
  
  // Agrupamento por Categoria
  const categoryMap = new Map<string, { qty: number; value: number }>();
  
  items.forEach((i) => {
    const catName = i.category;
    const cur = categoryMap.get(catName) || { qty: 0, value: 0 };
    cur.qty += i.quantity;
    cur.value += i.quantity * i.cost_price;
    categoryMap.set(catName, cur);
  });

  // Formata para o Recharts (Array de objetos)
  const pieData = Array.from(categoryMap.entries())
    .map(([name, d]) => ({ name, value: d.qty }))
    .filter(d => d.value > 0); // Remove categorias vazias

  const barData = Array.from(categoryMap.entries())
    .map(([name, d]) => ({ name, valor: d.value }))
    .filter(d => d.valor > 0);

  // Cards Superiores
  const stats = [
    { label: "Total Produtos", value: String(totalProducts), icon: Package },
    { label: "Unidades", value: String(totalUnits), icon: BarChart3 },
    { label: "Estoque Baixo", value: String(lowStock.length), icon: TrendingDown },
    { 
      label: "Valor Total", 
      value: totalValue.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' }), 
      icon: DollarSign 
    },
  ];

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
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 font-display text-xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Pie Chart (Estoque por Categoria) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-sm font-semibold text-foreground mb-4">Estoque por Categoria (Qtd)</h2>
            {pieData.length > 0 ? (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                      labelLine={false} 
                      fontSize={11}
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </div>

          {/* Bar Chart (Valor por Categoria) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-sm font-semibold text-foreground mb-4">Valor Investido por Categoria</h2>
            {barData.length > 0 ? (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(v: number) => v.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })} />
                    <Bar dataKey="valor" fill="hsl(152, 55%, 28%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Atenção: Estoque Baixo
                </h2>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {lowStock.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-lg bg-destructive/5 px-4 py-2.5">
                    <span className="text-sm font-medium text-foreground">{i.product_name}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Min: {i.min_quantity}</span>
                        <span className="text-sm font-mono text-destructive font-bold">{i.quantity} un</span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

            {/* Expiring Soon Alert */}
            {expiringSoon.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-orange-500" /> Próximos da Validade (3 meses)
                </h2>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {expiringSoon.map((i) => {
                    // Verifica se já venceu
                    const isExpired = i.expiry_date && new Date(i.expiry_date) < new Date();
                    return (
                        <div key={i.id} className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${isExpired ? 'bg-red-100 dark:bg-red-900/20' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
                        <span className="text-sm font-medium text-foreground">{i.product_name}</span>
                        <span className={`text-sm font-mono font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                            {i.expiry_date ? new Date(i.expiry_date).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                        </div>
                    );
                })}
                </div>
            </div>
            )}
        </div>
      </main>
    </div>
  );
}