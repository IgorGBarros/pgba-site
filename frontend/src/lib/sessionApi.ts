// lib/sessionApi.ts - NOVO ARQUIVO
import  {api } from '../services/api';

export const sessionApi = {
  // Inicia sessão
  start: async () => {
    const response = await api.post('/api/session-control/', { action: 'start' });
    return response.data;
  },
  
  // Status da sessão
  getStatus: async () => {
    const response = await api.get('/api/session-control/');
    return response.data;
  },
  
  // Finaliza sessão
  finish: async () => {
    const response = await api.post('/api/session-control/', { action: 'finish' });
    return response.data;
  },
  
  // Confirma investimento
  confirmInvestment: async (sessionId: number, data: any) => {
    const response = await api.post('/api/session-summary/', {
      session_id: sessionId,
      ...data
    });
    return response.data;
  }
};