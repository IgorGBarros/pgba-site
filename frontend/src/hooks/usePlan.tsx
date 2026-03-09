import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { profileApi } from "../lib/api";
import { useAuth } from "../../src/hooks/useAuth";

export type PlanType = "free" | "pro";

interface PlanCtx {
  plan: PlanType;
  isPro: boolean;
  loading: boolean;
  productLimit: number;
  refresh: () => void;
  setAdminOverride: (enabled: boolean) => void;
}

const PlanContext = createContext<PlanCtx>({
  plan: "free",
  isPro: false,
  loading: true,
  productLimit: 50,
  refresh: () => {},
  setAdminOverride: () => {},
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>("free");
  const [adminOverride, setAdminOverrideState] = useState(() => localStorage.getItem("admin_pro_override") === "true");
  const [loading, setLoading] = useState(true);

  const fetchPlan = () => {
    if (!user) { setLoading(false); return; }
    if (adminOverride) { setPlan("pro"); setLoading(false); return; }
    profileApi.get().then((p) => {
      setPlan((p as any).plan === "pro" ? "pro" : "free");
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const setAdminOverride = (enabled: boolean) => {
    if (enabled) {
      localStorage.setItem("admin_pro_override", "true");
    } else {
      localStorage.removeItem("admin_pro_override");
    }
    setAdminOverrideState(enabled);
    setPlan(enabled ? "pro" : "free");
  };

  useEffect(() => { fetchPlan(); }, [user, adminOverride]);

  const isPro = plan === "pro" || adminOverride;
  const productLimit = isPro ? Infinity : 50;

  return (
    <PlanContext.Provider value={{ plan: isPro ? "pro" : plan, isPro, loading, productLimit, refresh: fetchPlan, setAdminOverride }}>
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => useContext(PlanContext);
