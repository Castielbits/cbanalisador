import React, { useMemo, useState } from 'react';
import { AnalysisReport } from '../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartBarIcon, TargetIcon, BrainCircuitIcon, TrendingUpIcon } from './icons';
import DashboardFilters from './DashboardFilters';
import DetailedAnalytics from './DetailedAnalytics';
import ReportExporter from './ReportExporter';

interface Props {
  history: AnalysisReport[];
  onAnalyzeClick: () => void;
  onImport?: (data: any) => void;
}

const AdvancedDashboard: React.FC<Props> = ({ history, onAnalyzeClick, onImport }) => {
  const [filteredHistory, setFilteredHistory] = useState<AnalysisReport[]>(history);

  const stats = useMemo(() => {
    const totalAnalyzed = filteredHistory.length;
    const averageScore = totalAnalyzed > 0 
      ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.overallScore, 0) / totalAnalyzed) 
      : 0;
    
    const classifications = {
      quente: filteredHistory.filter(h => h.overallScore >= 80).length,
      morna: filteredHistory.filter(h => h.overallScore >= 60 && h.overallScore < 80).length,
      fria: filteredHistory.filter(h => h.overallScore < 60).length,
    };

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayAnalyses = filteredHistory.filter(h => {
        const reportDate = new Date(h.date);
        return reportDate >= dayStart && reportDate < dayEnd;
      });

      const avgScore = dayAnalyses.length > 0
        ? Math.round(dayAnalyses.reduce((acc, curr) => acc + curr.overallScore, 0) / dayAnalyses.length)
        : 0;

      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        score: avgScore,
        count: dayAnalyses.length,
      };
    });

    const firstHalf = filteredHistory.slice(Math.ceil(filteredHistory.length / 2));
    const secondHalf = filteredHistory.slice(0, Math.ceil(filteredHistory.length / 2));
    
    const firstHalfAvg = firstHalf.length > 0
      ? Math.round(firstHalf.reduce((acc, curr) => acc + curr.overallScore, 0) / firstHalf.length)
      : 0;
    
    const secondHalfAvg = secondHalf.length > 0
      ? Math.round(secondHalf.reduce((acc, curr) => acc + curr.overallScore, 0) / secondHalf.length)
      : 0;

    const improvement = secondHalfAvg - firstHalfAvg;

    return {
      totalAnalyzed,
      averageScore,
      classifications,
      chartData: last30Days,
      improvement,
      improvementPercent: firstHalfAvg > 0 ? Math.round((improvement / firstHalfAvg) * 100) : 0,
    };
  }, [filteredHistory]);

  const pieData = [
    { name: 'Quentes', value: stats.classifications.quente, color: '#10b981' },
    { name: 'Mornas', value: stats.classifications.morna, color: '#f59e0b' },
    { name: 'Frias', value: stats.classifications.fria, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardFilters history={history} onFilter={setFilteredHistory} />

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-[#ff6b00]/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ChartBarIcon className="w-16 h-16 text-[#ff6b00]" />
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Total Analisado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{stats.totalAnalyzed}</span>
            <span className="text-white/30 text-xs font-bold uppercase">Conversas</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-[#ff6b00]/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TargetIcon className="w-16 h-16 text-[#ff6b00]" />
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Score Médio</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{stats.averageScore}</span>
            <span className="text-white/30 text-xs font-bold uppercase">Pontos</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuitIcon className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Oportunidades Quentes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-green-400">{stats.classifications.quente}</span>
            <span className="text-white/30 text-xs font-bold uppercase">Altas</span>
          </div>
        </div>

        <div className={`bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group ${stats.improvement >= 0 ? 'hover:border-green-500/30' : 'hover:border-red-500/30'} transition-all`}>
          <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <TrendingUpIcon className={`w-16 h-16 ${stats.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Melhoria</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
            </span>
            <span className="text-white/30 text-xs font-bold uppercase">Pontos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff6b00]"></div>
            Evolução de Scores (Últimos 30 dias)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#ff6b00" 
                strokeWidth={3}
                dot={{ fill: '#ff6b00', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff6b00]"></div>
            Distribuição
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-white/30">
              Sem dados para exibir
            </div>
          )}
          <div className="mt-6 space-y-2 text-sm">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-white/70">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DetailedAnalytics history={filteredHistory} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`border-l-4 p-6 rounded-r-3xl ${stats.improvement >= 0 ? 'bg-green-500/5 border-green-500' : 'bg-red-500/5 border-red-500'}`}>
          <h4 className={`font-bold text-sm uppercase tracking-widest mb-2 ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.improvement >= 0 ? '📈 Tendência Positiva' : '📉 Tendência Negativa'}
          </h4>
          <p className="text-white/70 text-sm leading-relaxed">
            {stats.improvement >= 0 
              ? `Seus scores melhoraram em ${stats.improvementPercent}% comparado ao período anterior. Continue com as táticas que estão funcionando!`
              : `Seus scores diminuíram em ${Math.abs(stats.improvementPercent)}% comparado ao período anterior. Revise suas estratégias.`
            }
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#ff6b00]/10 to-transparent border-l-4 border-[#ff6b00] p-6 rounded-r-3xl">
          <h4 className="text-[#ff6b00] font-bold text-sm uppercase tracking-widest mb-2">💡 Dica de IA</h4>
          <p className="text-white/70 text-sm leading-relaxed">
            Prospectos que recebem follow-up em menos de 24h com um diagnóstico técnico real têm 3x mais chance de solicitar orçamento.
          </p>
        </div>
      </div>

      <ReportExporter history={filteredHistory} onImport={onImport} />

      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff6b00]"></div>
          Performance por Faixa de Score
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { range: '0-30', count: filteredHistory.filter(h => h.overallScore < 30).length, fill: '#ef4444' },
            { range: '30-60', count: filteredHistory.filter(h => h.overallScore >= 30 && h.overallScore < 60).length, fill: '#f59e0b' },
            { range: '60-80', count: filteredHistory.filter(h => h.overallScore >= 60 && h.overallScore < 80).length, fill: '#eab308' },
            { range: '80-100', count: filteredHistory.filter(h => h.overallScore >= 80).length, fill: '#10b981' },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#ff6b00" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
