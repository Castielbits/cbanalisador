
import React from 'react';
import { AnalysisReport, Scorecard, ScoreItem } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, EditIcon, LightbulbIcon, ClipboardIcon, ScriptIcon } from './icons';

const getScoreColor = (score: number) => {
  if (score >= 15) return 'text-green-400';
  if (score >= 10) return 'text-yellow-400';
  return 'text-red-400';
};

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const percentage = (score / 20) * 100;
  let bgColor = 'bg-red-500';
  if (score >= 15) bgColor = 'bg-green-500';
  else if (score >= 10) bgColor = 'bg-yellow-500';
  
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

const ScorecardItem: React.FC<{ title: string; item: ScoreItem }> = ({ title, item }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <h4 className="font-semibold text-gray-300">{title}</h4>
      <span className={`font-bold ${getScoreColor(item.score)}`}>{item.score} / 20</span>
    </div>
    <ScoreBar score={item.score} />
    <p className="text-xs text-gray-400 mt-2">{item.feedback}</p>
  </div>
);

const InfoCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <ul className="space-y-2 list-disc list-inside text-gray-300">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);


const AnalysisReportComponent: React.FC<{ report: AnalysisReport; onBack: () => void }> = ({ report, onBack }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
    
  return (
    <div className="animate-fade-in space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors font-bold uppercase text-sm">
        <ArrowLeftIcon className="h-5 w-5" />
        Início
      </button>

      <header className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white uppercase">Relatório de Análise</h2>
            <p className="text-gray-400 text-sm">Gerado em: {new Date(report.date).toLocaleString('pt-BR')}</p>
        </div>
        <div className="text-center">
            <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-widest">Score Geral</p>
            <p className={`text-5xl font-black ${getScoreColor(report.overallScore / 5)}`}>{report.overallScore}</p>
        </div>
        <div className="text-center sm:text-right">
            <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-widest">Classificação</p>
            <p className="px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase border border-orange-500/30">{report.classification}</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-gray-700 pb-2">Scorecard Detalhado</h3>
            <ScorecardItem title="Personalização" item={report.scorecard.personalizacao} />
            <ScorecardItem title="Proposta de Valor" item={report.scorecard.propostaDeValor} />
            <ScorecardItem title="Timing & Follow-up" item={report.scorecard.timingFollowUp} />
            <ScorecardItem title="Call to Action (CTA)" item={report.scorecard.cta} />
            <ScorecardItem title="Gestão de Objeções" item={report.scorecard.gestaoObjecoes} />
        </div>

        <div className="space-y-6">
            <InfoCard title="O que funcionou bem" items={report.whatWentWell} icon={<CheckCircleIcon className="h-6 w-6 text-green-400"/>} />
            <InfoCard title="O que pode melhorar" items={report.whatToImprove} icon={<EditIcon className="h-6 w-6 text-yellow-400"/>} />
        </div>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-lg border border-orange-500/30 border-l-orange-500 border-l-4">
        <div className="flex items-center gap-3 mb-3">
          <LightbulbIcon className="h-6 w-6 text-orange-500" />
          <h3 className="text-lg font-bold text-white uppercase">Próxima Ação Sugerida</h3>
        </div>
        <p className="text-gray-300 font-medium italic">"{report.suggestedNextAction}"</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <ScriptIcon className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white uppercase">Script Otimizado</h3>
          </div>
          <button onClick={() => copyToClipboard(report.improvedScript)} className="flex items-center gap-2 text-sm text-orange-500 hover:text-white transition-colors font-bold uppercase">
            <ClipboardIcon className="h-4 w-4"/> Copiar
          </button>
        </div>
        <pre className="bg-gray-900 p-4 rounded-md text-gray-300 whitespace-pre-wrap font-sans border border-gray-700">{report.improvedScript}</pre>
      </div>

    </div>
  );
};

export default AnalysisReportComponent;
