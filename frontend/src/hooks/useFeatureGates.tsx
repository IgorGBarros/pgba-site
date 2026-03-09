import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "../services/api"; // ✅ Usa a API do Django
import { usePlan } from "./usePlan"; // Corrigi o caminho relativo

export type FeatureKey =
  | "barcode_scanner"
  | "ocr_expiry"
  | "dashboard_charts"
  | "dashboard_kpi_advanced"
  | "ai_insights"
  | "storefront"
  | "chat_assistant"
  | "unlimited_products";

interface FeatureGate {
  feature_key: string;
  label: string;
  description: string | null;
  requires_pro: boolean;
}

interface FeatureGatesCtx {
  gates: FeatureGate[];
  loading: boolean;
  /** Returns true if the feature is locked (requires pro and user is free) */
  isLocked: (key: FeatureKey) => boolean;
  /** Returns true if the feature requires pro plan */
  requiresPro: (key: FeatureKey) => boolean;
  refresh: () => void;
}

const FeatureGatesContext = createContext<FeatureGatesCtx>({
  gates: [],
  loading: true,
  isLocked: () => true,
  requiresPro: () => true,
  refresh: () => {},
});

// Fallback estático caso a API do Django ainda não tenha a rota /feature-gates/
const DEFAULT_GATES: FeatureGate[] = [
  { feature_key: "barcode_scanner", label: "Scanner de Código", description: null, requires_pro: true },
  { feature_key: "ocr_expiry", label: "Leitor de Validade (IA)", description: null, requires_pro: true },
  { feature_key: "dashboard_charts", label: "Gráficos Avançados", description: null, requires_pro: true },
  { feature_key: "dashboard_kpi_advanced", label: "Lucro e Rentabilidade", description: null, requires_pro: true },
  { feature_key: "ai_insights", label: "Insights com Inteligência Artificial", description: null, requires_pro: true },
  { feature_key: "storefront", label: "Vitrine Digital", description: null, requires_pro: true },
  { feature_key: "chat_assistant", label: "Assistente de Estoque", description: null, requires_pro: true },
  { feature_key: "unlimited_products", label: "Produtos Ilimitados", description: null, requires_pro: true },
];

export function FeatureGatesProvider({ children }: { children: ReactNode }) {
  const { isPro } = usePlan();
  const [gates, setGates] = useState<FeatureGate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGates = useCallback(async () => {
    setLoading(true);
    try {
      // 🚨 MUDANÇA: Chama a API do Render (Django)
      const { data } = await api.get<FeatureGate[]>("/admin/feature-gates/");
      if (Array.isArray(data)) {
         setGates(data);
      } else {
         setGates(DEFAULT_GATES);
      }
    } catch (err) {
      console.warn("Rota /admin/feature-gates/ não encontrada ou falhou. Usando padrão local.");
      // Fallback: Usa os portões estáticos definidos acima se o Django não estiver pronto
      setGates(DEFAULT_GATES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGates();
  }, [fetchGates]);

  const requiresPro = useCallback(
    (key: FeatureKey): boolean => {
      const gate = gates.find((g) => g.feature_key === key);
      // If gate not found, default to requiring pro
      return gate ? gate.requires_pro : true;
    },
    [gates]
  );

  const isLocked = useCallback(
    (key: FeatureKey): boolean => {
      if (isPro) return false;
      return requiresPro(key);
    },
    [isPro, requiresPro]
  );

  return (
    <FeatureGatesContext.Provider value={{ gates, loading, isLocked, requiresPro, refresh: fetchGates }}>
      {children}
    </FeatureGatesContext.Provider>
  );
}

export const useFeatureGates = () => useContext(FeatureGatesContext);