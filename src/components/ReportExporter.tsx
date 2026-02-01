import React from 'react';
import { AnalysisReport } from '../types';
import { DownloadIcon } from './icons';

interface Props {
  history: AnalysisReport[];
}

const ReportExporter: React.FC<Props> = ({ history }) => {
  const generateCSV = () => {
    const headers = ['Data', 'Score', 'Classificação', 'Ação Sugerida', 'Conversa Original'];
    const rows = history.map(item => [
      new Date(item.date).toLocaleDateString('pt-BR'),
      item.overallScore,
      item.classification,
      item.suggestedNextAction,
      item.originalConversation.substring(0, 100).replace(/"/g, '""'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalAnalyzed: history.length,
      averageScore: Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / history.length),
      analyses: history,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#ff6b00]"></div>
        Exportar Relatório
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={generateCSV}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#ff6b00]/10 border border-[#ff6b00]/30 hover:border-[#ff6b00] rounded-2xl text-white font-medium transition-all group"
        >
          <DownloadIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Exportar CSV
        </button>

        <button
          onClick={generateJSON}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#ff6b00]/10 border border-[#ff6b00]/30 hover:border-[#ff6b00] rounded-2xl text-white font-medium transition-all group"
        >
          <DownloadIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Exportar JSON
        </button>
      </div>

      <p className="text-white/50 text-sm mt-4">
        Exporte seus dados para análise em ferramentas externas ou para backup.
      </p>
    </div>
  );
};

export default ReportExporter;
