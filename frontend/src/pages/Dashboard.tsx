// components/Dashboard.tsx - VERSÃO MELHORADA

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';
interface DashboardData {
  store_info: {
    name: string;
    plan: string;
    created_at: string;
  };
  inventory: {
    total_products: number;
    total_stock: number;
    avg_stock_value: number;
    low_stock_count: number;
  };
  sales: {
    total_sales_30d: number;
    total_revenue_30d: number;
    total_items_sold_30d: number;
    avg_ticket: number;
  };
  daily_sales: Array<{
    date: string;
    day_name: string;
    revenue: number;
    quantity: number;
  }>;
  top_products: Array<{
    name: string;
    id: number;
    total_sold: number;
    revenue: number;
  }>;
  alerts: {
    low_stock: Array<{
      id: number;
      product_name: string;
      current_stock: number;
      min_stock: number;
      status: 'critical' | 'warning';
    }>;
    expiring_soon: Array<{
      id: number;
      product_name: string;
      batch_code: string;
      expiration_date: string;
      quantity: number;
      days_to_expire: number;
    }>;
  };
  sessions: {
    total_sessions_30d: number;
    total_products_registered_30d: number;
    avg_session_duration: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // ✅ NOVA API: Usar endpoint melhorado
      const response = await api.get('/dashboard/overview/');
      setData(response.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{data.store_info.name} • Plano {data.store_info.plan}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.sales.total_revenue_30d)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.sales.total_sales_30d} vendas • Ticket médio: {formatCurrency(data.sales.avg_ticket)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inventory.total_products}</div>
            <p className="text-xs text-muted-foreground">
              {data.inventory.total_stock} unidades totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Vendidos (30d)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.sales.total_items_sold_30d}</div>
            <p className="text-xs text-muted-foreground">
              Em {data.sales.total_sales_30d} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.alerts.low_stock.length + data.alerts.expiring_soon.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.alerts.low_stock.length} estoque baixo • {data.alerts.expiring_soon.length} vencendo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Vendas dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.daily_sales.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                  <div>
                    <div className="font-medium">{day.day_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(day.revenue)}</div>
                    <div className="text-sm text-muted-foreground">{day.quantity} itens</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Produtos Mais Vendidos (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.top_products.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.total_sold} vendidos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(data.alerts.low_stock.length > 0 || data.alerts.expiring_soon.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estoque Baixo */}
          {data.alerts.low_stock.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Estoque Baixo ({data.alerts.low_stock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.alerts.low_stock.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-orange-50 border border-orange-200">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Mín: {item.min_stock} • Atual: {item.current_stock}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'critical' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.status === 'critical' ? 'Crítico' : 'Atenção'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Produtos Vencendo */}
          {data.alerts.expiring_soon.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Calendar className="h-5 w-5" />
                  Vencendo em Breve ({data.alerts.expiring_soon.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.alerts.expiring_soon.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-red-50 border border-red-200">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Lote: {item.batch_code} • {item.quantity} unidades
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-600">
                          {item.days_to_expire} dias
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.expiration_date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sessões de Cadastro */}
      {data.sessions.total_sessions_30d > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade de Cadastro (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.sessions.total_sessions_30d}</div>
                <div className="text-sm text-muted-foreground">Sessões</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data.sessions.total_products_registered_30d}</div>
                <div className="text-sm text-muted-foreground">Produtos Cadastrados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(data.sessions.avg_session_duration)}</div>
                <div className="text-sm text-muted-foreground">Minutos Médios/Sessão</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}