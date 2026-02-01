import React, { useRef } from 'react';
import { AnalysisReport } from '../types';
import { EyeIcon, TrashIcon, UploadIcon, DownloadIcon } from './icons';

interface AnalysisHistoryProps {
  history: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onClearHistory: () => void;
  onExportHistory: () => void;
  onImportHistory: (file: File) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return 'border-l-green-400';
  if (score >= 50) return 'border-l-yellow-400';
  return 'border-l-red-400';
};

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, onViewReport, onClearHistory, onExportHistory, onImportHistory }) => {
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (importInputRef.current) {
        importInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportHistory(file);
    }
    // Reseta o valor para permitir importar o mesmo arquivo novamente
    if (event.target) {
        event.target.value = '';
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-white">Histórico de Análises</h2>
        <div className="flex items-center gap-2 flex-wrap">
            {/* Input oculto mas acessível para o script */}
            <input
              type="file"
              ref={importInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".json"
            />
            <button
                type="button"
                onClick={handleImportClick}
                className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
            >
                <UploadIcon className="h-4 w-4"/>
                Importar Backup
            </button>
            
            {history.length > 0 && (
              <>
                <button
                    onClick={onExportHistory}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                >
                    <DownloadIcon className="h-4 w-4"/>
                    Exportar
                </button>
                <button 
                    onClick={onClearHistory}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                >
                    <TrashIcon className="h-4 w-4"/>
                    Limpar Tudo
                </button>
              </>
            )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">Nenhuma análise salva no dispositivo.</p>
          <p className="text-gray-500 text-sm mt-2">
            Use o botão "Importar Backup" para carregar seus dados salvos anteriormente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((report) => (
            <div
              key={report.id}
              className={`bg-gray-800 border ${getScoreColor(report.overallScore)} border-l-4 border-y-gray-700 border-r-gray-700 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-transform hover:bg-gray-750`}
            >
              <div className="flex-grow min-w-0">
                <p className="text-xs text-gray-500">{new Date(report.date).toLocaleString('pt-BR')}</p>
                <p className="text-gray-300 mt-1 truncate italic">
                  "{report.originalConversation?.substring(0, 100)}..."
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
                  <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">{report.overallScore}</span>
                      <span className="text-xs text-gray-500">/100</span>
                  </div>
                   <button 
                      onClick={() => onViewReport(report)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors w-full sm:w-auto"
                  >
                      <EyeIcon className="h-4 w-4" /> Ver Análise
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AnalysisHistory;
