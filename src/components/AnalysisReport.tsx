import React from 'react';
import { AnalysisReport } from '../types';
import { TargetIcon, BrainCircuitIcon } from './icons';

interface Props {
  report: AnalysisReport;
}

const AnalysisReportView: React.FC<Props> = ({ report }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Pontuação Geral</p>
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * report.overallScore) / 100}
                className="text-[#ff6b00] transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-4xl font-black text-white">{report.overallScore}</span>
          </div>
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            report.overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
            report.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {report.classification}
          </span>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <TargetIcon className="w-5 h-5 text-[#ff6b00]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Próxima Ação Sugerida</h3>
          </div>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            "{report.nextAction}"
          </p>
        </div>
      </div>

      {/* Script Melhorado */}
      <div className="bg-[#0a0a0a] border border-[#ff6b00]/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <BrainCircuitIcon className="w-24 h-24 text-[#ff6b00]" />
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse"></div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#ff6b00]">Script Melhorado pela IA</h3>
        </div>
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
          <p className="text-white/90 text-lg font-serif italic leading-relaxed whitespace-pre-wrap">
            {report.improvedScript}
          </p>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(report.improvedScript)}
          className="mt-6 text-xs text-white/30 hover:text-[#ff6b00] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          Copiar Script
        </button>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Pontos Fortes</h4>
          <ul className="space-y-3">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                <span className="text-green-500 mt-1">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Pontos de Melhoria</h4>
          <ul className="space-y-3">
            {report.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                <span className="text-red-500 mt-1">!</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportView;
