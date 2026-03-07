import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import AddProduct from "./pages/AddProduct";
import WithdrawProduct from "./pages/WithdrawProduct";
import Dashboard from "./pages/Dashboard";
import Storefront from "./pages/Storefront";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StockWizard from "./pages/StockWizard";
import StockHistory from "./pages/StockHistory";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/stock/entry" element={<StockWizard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/withdraw" element={<WithdrawProduct />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/vitrine" element={<Storefront />} />
          <Route path="/stock/history" element={<StockHistory />} />
       
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
