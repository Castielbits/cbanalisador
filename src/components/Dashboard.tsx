import React from 'react';
import { AnalysisReport } from '../types';
import { ChartBarIcon, TargetIcon, BrainCircuitIcon } from './icons';

interface Props {
  history: AnalysisReport[];
  onAnalyzeClick: () => void;
}

const Dashboard: React.FC<Props> = ({ history, onAnalyzeClick }) => {
  const totalAnalyzed = history.length;
  const averageScore = totalAnalyzed > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / totalAnalyzed) 
    : 0;
  
  const hotOpportunities = history.filter(h => h.overallScore >= 80).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Bem-vindo, Pedro</h2>
          <p className="text-white/50 text-sm">Acompanhe a evolução das suas prospecções na Castiel Bits.</p>
        </div>
        <button 
          onClick={onAnalyzeClick}
          className="bg-[#ff6b00] hover:bg-[#ff8c33] text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#ff6b00]/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
        >
          <BrainCircuitIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          NOVA ANÁLISE
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ChartBarIcon className="w-16 h-16 text-[#ff6b00]" />
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Total Analisado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{totalAnalyzed}</span>
            <span className="text-white/30 text-xs font-bold uppercase">Conversas</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TargetIcon className="w-16 h-16 text-[#ff6b00]" />
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Score Médio</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{averageScore}</span>
            <span className="text-white/30 text-xs font-bold uppercase">Pontos</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuitIcon className="w-16 h-16 text-[#ff6b00]" />
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Oportunidades Quentes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{hotOpportunities}</span>
            <span className="text-white/30 text-xs font-bold uppercase">Altas</span>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-[#ff6b00]/10 to-transparent border-l-4 border-[#ff6b00] p-6 rounded-r-3xl">
        <h4 className="text-[#ff6b00] font-bold text-sm uppercase tracking-widest mb-2">Dica de IA</h4>
        <p className="text-white/70 text-sm leading-relaxed">
          "Prospectos que recebem follow-up em menos de 24h com um diagnóstico técnico real têm 3x mais chance de solicitar orçamento."
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
