// lib/sessionApi.ts - NOVO ARQUIVO
const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com")
  .replace(/\/$/, "");

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export interface SessionStatus {
  has_session: boolean;
  products_count?: number;
  duration_minutes?: number;
  total_estimated_cost?: number;
  session_id?: number;
}

export interface SessionSummary {
  products_count: number;
  total_estimated_cost: number;
  duration_minutes: number;
  session_id: number;
}

export const sessionApi = {
  getStatus: async (): Promise<SessionStatus> => {
    try {
      console.log('🔍 Verificando status da sessão...');
      
      const response = await fetch(`${API_BASE_URL}/session-control/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return { has_session: false };
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Status da sessão:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      return { has_session: false };
    }
  },

  startSession: async () => {
    const response = await fetch(`${API_BASE_URL}/session-control/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ action: 'start' })
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  finishSession: async () => {
    const response = await fetch(`${API_BASE_URL}/session-control/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ action: 'finish' })
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/session-summary/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
};