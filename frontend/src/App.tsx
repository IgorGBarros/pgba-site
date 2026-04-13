// App.tsx - Versão integrada com seus providers existentes
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import { ThemeProvider } from "../src/hooks/useTheme";


// ✅ NOVO IMPORT


// Suas páginas existentes

import PGBA from "./pages/pgba/PGBA";
// Nova página PGBA Neural Canvas
import PGBANeural from "./pages/pgba/PGBANeural";
import PGBASite from "./pages/pgba/PGBASite";
const queryClient = new QueryClient();

// ✅ NOVO: Componente Layout com SessionHeader
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
                <Routes>
                
    <Routes>
      <Route path="/" element={<Navigate to="/pgba" replace />} />
      <Route path="/pgba" element={<PGBA />} />
      <Route path="/site" element={<PGBASite />} />
      <Route path="/neural" element={<PGBANeural />} />
    </Routes>
                  

               
                  
         
                </Routes>
              </BrowserRouter>

      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;