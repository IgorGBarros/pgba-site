// App.tsx - Versão integrada com seus providers existentes
import { Toaster } from "../src/components/ui/toaster";
import { Toaster as Sonner } from "../src/components/ui/sonner";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";



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

      <TooltipProvider>
        <Toaster />
        <Sonner />
    

      
              <BrowserRouter>
                <Routes>
                  {/* Rotas públicas (SEM SessionHeader) */}
                  <Route path="/neural" element={<PGBANeural />} />
                  <Route path="/site" element={<PGBASite />} />
                  <Route path="/pgba" element={<PGBA />} />

                  
                              </Routes>
              </BrowserRouter>
   
      </TooltipProvider>

  </QueryClientProvider>
);

export default App;