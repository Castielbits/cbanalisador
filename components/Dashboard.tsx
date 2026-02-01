
import React from 'react';
import { AnalysisReport, BusinessStats } from '../types';
import { TargetIcon, ChartBarIcon, LightbulbIcon, CheckCircleIcon } from './icons';

interface DashboardProps {
  history: AnalysisReport[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const calculateStats = (): BusinessStats => {
    if (history.length === 0) return { totalAnalyzed: 0, averageScore: 0, hotOpportunities: 0, topImprovementArea: 'N/A' };

    const total = history.length;
    const avg = history.reduce((acc, curr) => acc + curr.overallScore, 0) / total;
    const hot = history.filter(h => h.classification === 'Oportunidade Quente').length;
    
    const areas = ['personalizacao', 'propostaDeValor', 'timingFollowUp', 'cta', 'gestaoObjecoes'];
    const areaScores = areas.map(area => ({
      name: area,
      avg: history.reduce((acc, curr) => acc + (curr.scorecard as any)[area].score, 0) / total
    }));
    const worstArea = areaScores.sort((a, b) => a.avg - b.avg)[0].name;

    const areaLabels: Record<string, string> = {
      personalizacao: 'Personalização',
      propostaDeValor: 'Proposta de Valor',
      timingFollowUp: 'Timing & Follow-up',
      cta: 'Chamada para Ação (CTA)',
      gestaoObjecoes: 'Gestão de Objeções'
    };

    return {
      totalAnalyzed: total,
      averageScore: Math.round(avg),
      hotOpportunities: hot,
      topImprovementArea: areaLabels[worstArea] || worstArea.toUpperCase()
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Total Analyzed */}
      <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl transition-all hover:border-orange-500/30 group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ChartBarIcon className="h-24 w-24 text-white" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <ChartBarIcon className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Interações Totais</p>
        </div>
        <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-white tracking-tighter">{stats.totalAnalyzed}</p>
            <p className="text-xs text-blue-500 font-bold mb-1.5 uppercase">Analistas</p>
        </div>
      </div>

      {/* Average Score */}
      <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl transition-all hover:border-orange-500/30 group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TargetIcon className="h-24 w-24 text-white" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20 text-orange-400">
            <TargetIcon className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Saúde da Conversão</p>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-4xl font-black text-white tracking-tighter">{stats.averageScore}</p>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">/100</p>
        </div>
        <div className="relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
            style={{ width: `${stats.averageScore}%` }}
          ></div>
        </div>
      </div>

      {/* Hot Opportunities */}
      <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl transition-all hover:border-orange-500/30 group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircleIcon className="h-24 w-24 text-white" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20 text-green-400">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Oportunidades</p>
        </div>
        <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-white tracking-tighter">{stats.hotOpportunities}</p>
            <p className="text-xs text-green-500 font-bold mb-1.5 uppercase">Quentes</p>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Potencial de fechamento imediato</p>
        </div>
      </div>

      {/* Improvement Focus */}
      <div className="relative overflow-hidden bg-gray-900/40 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl transition-all hover:border-orange-500/30 group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <LightbulbIcon className="h-24 w-24 text-white" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-400">
            <LightbulbIcon className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.15em]">Gargalo Comercial</p>
        </div>
        <div className="min-h-[44px]">
            <p className="text-sm font-black text-white leading-tight uppercase tracking-tight line-clamp-2">
                {stats.topImprovementArea}
            </p>
        </div>
        <p className="text-[9px] text-yellow-500/80 font-bold uppercase tracking-[0.1em] mt-2 inline-flex items-center gap-1">
            <span className="bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">Foco Prioritário</span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
