// App.tsx - Versão corrigida
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";

// Páginas

import PGBANeural from "./pages/pgba/PGBANeural";
import PGBASite from "./pages/pgba/PGBASite";

const queryClient = new QueryClient();

// Layout wrapper (pode adicionar SessionHeader aqui futuramente)
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">
    {children}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/site" replace />} />
 
              <Route path="/site" element={<PGBASite />} />
              <Route path="/neural" element={<PGBANeural />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;