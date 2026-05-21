// src/components/pgba/CookieConsentBanner.tsx
import React, { useState } from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTheme } from '../../hooks/useTheme';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Shield, Settings, Check, X } from 'lucide-react';

interface CookieConsentBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ 
  onAccept, 
  onReject 
}) => {
  const themeCtx = useTheme();
  const isDark = (themeCtx as any).isDark ?? (themeCtx as any).theme === 'dark';
  const { updateConsent } = useAnalytics();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Cores alinhadas ao design system da PGBA
  const colors = {
    bg: isDark ? '#0f172a' : '#ffffff',
    border: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    primary: 'linear-gradient(to right, #06b6d4, #3b82f6)',
    primaryHover: 'linear-gradient(to right, #22d3ee, #60a5fa)',
    danger: isDark ? '#ef4444' : '#dc2626',
  };

  const handleAccept = () => {
    updateConsent(true);
    onAccept?.();
  };

  const handleReject = () => {
    updateConsent(false);
    onReject?.();
  };

  return (
    <CookieConsent
      location="bottom"
      buttonText="Aceitar Todos"
      declineButtonText="Rejeitar Não-Essenciais"
      cookieName="cookie-consent"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: '14px',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: isDark 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
          : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        maxWidth: '56rem',
        margin: '0 auto 1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
      buttonStyle={{
        background: colors.primary,
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        padding: '0.75rem 1.5rem',
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: colors.textMuted,
        fontSize: '14px',
        fontWeight: '500',
        padding: '0.75rem 1.5rem',
        borderRadius: '9999px',
        border: `1px solid ${colors.border}`,
        cursor: 'pointer',
        marginRight: '0.5rem',
        transition: 'all 0.2s ease',
      }}
      onAccept={handleAccept}
      onDecline={handleReject}
      enableDeclineButton
      flipButtons
      expires={365}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-500" />
          <h3 className="font-bold text-base">Preferências de Privacidade</h3>
        </div>

        {/* Descrição */}
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Usamos cookies e tecnologias similares para melhorar sua experiência, 
          analisar tráfego e personalizar conteúdo. Você pode aceitar todos, 
          rejeitar os não-essenciais ou{' '}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-cyan-500 hover:text-cyan-400 font-medium underline"
          >
            personalizar suas preferências
          </button>.
        </p>

        {/* Configurações Avançadas (LGPD) */}
        {showAdvanced && (
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4" />
              <span className="font-semibold text-sm">Categorias de Cookies</span>
            </div>
            
            {/* Necessários (sempre ativos) */}
            <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
              <div>
                <p className="font-medium text-sm">Estritamente Necessários</p>
                <p className={`text-xs ${colors.textMuted}`}>Essenciais para o funcionamento do site</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <Check className="w-4 h-4" />
                <span className="text-xs font-medium">Sempre ativos</span>
              </div>
            </div>
            
            {/* Analytics */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Analytics e Métricas</p>
                <p className={`text-xs ${colors.textMuted}`}>Nos ajudam a entender como você usa o site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  defaultChecked 
                  onChange={(e) => updateConsent(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 text-xs">
          <a 
            href="/privacidade" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-400 font-medium"
          >
            Política de Privacidade
          </a>
          <span className={colors.textMuted}>•</span>
          <a 
            href="/termos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-400 font-medium"
          >
            Termos de Uso
          </a>
        </div>
      </div>
    </CookieConsent>
  );
};