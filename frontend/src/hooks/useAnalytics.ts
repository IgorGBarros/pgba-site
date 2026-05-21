// src/hooks/useAnalytics.ts
import { useCallback } from 'react';

// Tipos para GA4
export type GA4EventParams = {
  [key: string]: string | number | boolean | null | undefined;
};

export const useAnalytics = () => {
  // Verifica se estamos em ambiente de produção e se o consentimento foi dado
  const hasConsent = useCallback(() => {
    if (import.meta.env.DEV) return false; // Não trackear em dev
    return document.cookie.includes('cookie-consent=accepted');
  }, []);

  // Pageview seguro para GA4
  const trackPageView = useCallback((path: string, title?: string) => {
    if (!hasConsent() || !import.meta.env.VITE_GA4_ID) return;
    
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      });
    }
  }, [hasConsent]);

  // Eventos customizados seguros
  const trackEvent = useCallback((eventName: string, params?: GA4EventParams) => {
    if (!hasConsent() || !import.meta.env.VITE_GA4_ID) return;
    
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        // LGPD: anonimização adicional
        anonymize_ip: true,
      });
    }
  }, [hasConsent]);

  // Atualiza o consentimento no GA4 (Consent Mode v2)
  const updateConsent = useCallback((accepted: boolean) => {
    if (!import.meta.env.VITE_GA4_ID) return;
    
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': accepted ? 'granted' : 'denied',
        'ad_storage': accepted ? 'granted' : 'denied',
        'ad_user_data': accepted ? 'granted' : 'denied',
        'ad_personalization': accepted ? 'granted' : 'denied',
      });
    }
    
    // Salva preferência no cookie (365 dias)
    document.cookie = `cookie-consent=${accepted ? 'accepted' : 'rejected'}; max-age=31536000; path=/; SameSite=Lax`;
  }, []);

  return { trackPageView, trackEvent, updateConsent, hasConsent };
};

// Extendendo tipos globais para TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}