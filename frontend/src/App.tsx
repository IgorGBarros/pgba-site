// App.tsx - Versão integrada com seus providers existentes
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../src/hooks/useAuth";
import { PlanProvider } from "../src/hooks/usePlan";
import { FeatureGatesProvider } from "../src/hooks/useFeatureGates";
import { ThemeProvider } from "../src/hooks/useTheme";
import ProtectedRoute from "../src/components/ProtectedRoute";

// Suas páginas existentes
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import AddProduct from "./pages/AddProduct";
import WithdrawProduct from "./pages/WithdrawProduct";
import StockWizard from "./pages/StockWizard";
import Dashboard from "./pages/Dashboard";
import Storefront from "./pages/Storefront";
import Settings from "./pages/Settings";
import MovementHistory from "./pages/MovementHistory";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Plans from "./pages/Plans";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import PGBA from "./pages/pgba/PGBA";

// Nova página PGBA Neural Canvas
import PGBANeural from "./pages/pgba/PGBANeural";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <PlanProvider>
            <FeatureGatesProvider>
              <BrowserRouter>
                <Routes>
                  {/* Rota pública para o PGBA Neural Canvas */}
                  <Route path="/neural" element={<PGBANeural />} />
                  <Route path="/pgba" element={<PGBA />} />
                  {/* Suas rotas existentes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
                  <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
                  <Route path="/products/:id/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
                  <Route path="/stock/entry" element={<ProtectedRoute><StockWizard /></ProtectedRoute>} />
                  <Route path="/add" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                  <Route path="/withdraw" element={<ProtectedRoute><WithdrawProduct /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><MovementHistory /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                  <Route path="/vitrine/:slug" element={<Storefront />} />
                  <Route path="/vitrine" element={<Storefront />} />
                  <Route path="/admin-panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                  <Route path="/lp" element={<LandingPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </FeatureGatesProvider>
          </PlanProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;