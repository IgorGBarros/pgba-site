import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, Check } from 'lucide-react';
import { sessionApi } from '../lib/sessionApi';
import { SessionSummaryModal } from './SessionSummaryModal'; // ✅ IMPORT ADICIONADO

export function SessionHeader() {
  const [session, setSession] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const status = await sessionApi.getStatus();
      if (status.has_session) {
        setSession(status);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  };

  const finishSession = async () => {
    try {
      const result = await sessionApi.finish();
      setSession(null);
      
      // Mostra modal de resumo
      if (result.session_summary && result.session_summary.products_count > 0) {
        setSummaryData(result.session_summary);
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  };

  if (!session) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Package size={16} />
          <span className="text-sm font-medium">
            Cadastrando... {session.products_count} produtos
          </span>
          <div className="flex items-center gap-1 text-blue-200">
            <Clock size={12} />
            <span className="text-xs">{session.duration_minutes}min</span>
          </div>
        </div>
        
        <button 
          onClick={finishSession}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <Check size={14} />
          Finalizar
        </button>
      </motion.div>

      {/* Modal de Resumo */}
      {showSummary && summaryData && (
        <SessionSummaryModal 
          summary={summaryData}
          onClose={() => {
            setShowSummary(false);
            setSummaryData(null);
          }}
        />
      )}
    </>
  );
}