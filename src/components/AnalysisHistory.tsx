import React from 'react';
import { AnalysisReport } from '../types';
import { IconHistory } from './icons';

interface Props {
  history: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onDelete: (id: string) => void;
}

const AnalysisHistory: React.FC<Props> = ({ history, onViewReport, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <IconHistory />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Histórico Vazio</h3>
        <p className="text-white/50 max-w-xs mx-auto text-sm">
          Suas análises aparecerão aqui assim que você começar a prospectar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Histórico de Análises</h2>
        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/50">
          {history.length} {history.length === 1 ? 'análise' : 'análises'}
        </span>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <div 
            key={item.id}
            className="group bg-[#0a0a0a] border border-white/5 hover:border-[#ff6b00]/30 rounded-2xl p-5 transition-all cursor-pointer"
            onClick={() => onViewReport(item)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
                    item.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.classification}
                  </span>
                  <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-white/70 line-clamp-2 italic mb-3">
                  "{item.originalConversation.substring(0, 150)}..."
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]"></div>
                    <span className="text-xs font-bold text-white">Score: {item.overallScore}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <IconHistory />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistory;
