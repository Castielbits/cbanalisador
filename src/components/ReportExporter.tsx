import React, { useRef } from 'react';
import { AnalysisReport } from '../types';
import { DownloadIcon, UploadIcon } from './icons';

interface Props {
  history: AnalysisReport[];
  onImport?: (importedData: any) => void;
}

const ReportExporter: React.FC<Props> = ({ history, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (onImport) {
          onImport(json);
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON. Verifique o formato.');
        console.error('Erro na importação:', err);
      }
    };
    reader.readAsText(file);
    // Limpar o input para permitir importar o mesmo arquivo novamente se necessário
    event.target.value = '';
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#ff6b00]"></div>
        Gerenciar Dados
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={generateCSV}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl text-white font-medium transition-all group"
        >
          <DownloadIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Exportar CSV
        </button>

        <button
          onClick={generateJSON}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:border-white/30 rounded-2xl text-white font-medium transition-all group"
        >
          <DownloadIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Exportar JSON
        </button>

        <button
          onClick={handleImportClick}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#ff6b00]/10 border border-[#ff6b00]/30 hover:border-[#ff6b00] rounded-2xl text-white font-medium transition-all group"
        >
          <UploadIcon className="w-5 h-5 group-hover:scale-110 transition-transform text-[#ff6b00]" />
          Importar JSON
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <p className="text-white/50 text-sm mt-4">
        Exporte seus dados para backup ou importe análises feitas externamente no Google AI Studio.
      </p>
    </div>
  );
};

export default ReportExporter;
