
import React, { useState, useCallback } from 'react';
import { AnalysisReport, EvolutionConfig } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { analyzeConversation } from './services/geminiService';
import ConversationInput from './components/ConversationInput';
import AnalysisReportComponent from './components/AnalysisReport';
import AnalysisHistory from './components/AnalysisHistory';
import LiveCoach from './components/LiveCoach';
import Dashboard from './components/Dashboard';
import IntegrationSettings from './components/IntegrationSettings';
import ChatSelector from './components/ChatSelector';
import { LogoIcon, ChartBarIcon, BrainCircuitIcon, TargetIcon, SettingsIcon } from './components/icons';

type Mode = 'dashboard' | 'analyzer' | 'liveCoach' | 'settings';

const App: React.FC = () => {
  const [history, setHistory] = useLocalStorage<AnalysisReport[]>('prospecting-analysis-history', []);
  const [evolutionConfig, setEvolutionConfig] = useLocalStorage<EvolutionConfig>('evolution-config', {
    baseUrl: '',
    apiKey: '7C287EFD8CF4-4343-89CA-89E10C429CB6',
    instanceName: ''
  });
  
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('dashboard');

  const handleAnalyze = useCallback(async (conversation: string) => {
    if (!conversation.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeConversation(conversation);
      const newReport: AnalysisReport = {
        ...result,
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString(),
        originalConversation: conversation,
      };
      setHistory(prev => [newReport, ...prev]);
      setCurrentReport(newReport);
      setMode('analyzer');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao analisar a conversa.');
    } finally {
      setIsLoading(false);
    }
  }, [setHistory]);

  const handleViewReport = (report: AnalysisReport) => {
    setCurrentReport(report);
  };

  const handleReturnHome = () => {
    setCurrentReport(null);
  };
  
  const handleClearHistory = () => {
    if (window.confirm('Apagar todo o histórico permanentemente?')) {
        setHistory([]);
    }
  };

  const handleExportHistory = () => {
      if (history.length === 0) return alert("Histórico vazio.");
      const exportData = { 
        source: "Castiel Bits Backup",
        version: "1.1", 
        timestamp: new Date().toISOString(),
        history: history 
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-castiel-bits-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
  };

  const handleImportHistory = (file: File) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              if (!text) throw new Error("Arquivo vazio.");
              
              const rawData = JSON.parse(text);
              
              // Tenta extrair o histórico de diferentes formatos possíveis
              let imported: AnalysisReport[] = [];
              if (Array.isArray(rawData)) {
                  imported = rawData;
              } else if (rawData.history && Array.isArray(rawData.history)) {
                  imported = rawData.history;
              } else {
                  throw new Error("Formato de backup inválido. O JSON deve conter uma lista de análises.");
              }

              if (imported.length === 0) {
                  alert("Nenhum dado encontrado no arquivo.");
                  return;
              }
              
              if (window.confirm(`Deseja importar ${imported.length} registros para o seu histórico atual?`)) {
                  setHistory(prev => {
                      const existingIds = new Set(prev.map(r => r.id));
                      const newItems = imported.filter((r: any) => r.id && !existingIds.has(r.id));
                      return [...newItems, ...prev];
                  });
                  alert("Importação concluída com sucesso!");
              }
          } catch (err: any) { 
              console.error("Erro no parse do JSON:", err);
              alert(`Erro ao importar: ${err.message || "O arquivo selecionado não é um JSON válido de backup."}`);
          }
      };

      reader.onerror = () => {
          alert("Erro físico ao ler o arquivo do disco.");
      };

      reader.readAsText(file);
  };

  const renderContent = () => {
    if (currentReport) return <AnalysisReportComponent report={currentReport} onBack={handleReturnHome} />;
    
    switch (mode) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in">
             <Dashboard history={history} />
             <AnalysisHistory 
                history={history} 
                onViewReport={handleViewReport} 
                onClearHistory={handleClearHistory}
                onExportHistory={handleExportHistory}
                onImportHistory={handleImportHistory}
            />
          </div>
        );
      case 'analyzer':
        return (
          <div className="space-y-6">
            <ConversationInput onAnalyze={handleAnalyze} isLoading={isLoading} error={error} />
            <ChatSelector config={evolutionConfig} onImport={handleAnalyze} />
          </div>
        );
      case 'liveCoach':
        return <LiveCoach />;
      case 'settings':
        return <IntegrationSettings config={evolutionConfig} onUpdate={setEvolutionConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans p-4 sm:p-6 lg:p-8 selection:bg-orange-500 selection:text-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center gap-6 mb-10 py-6 border-b border-gray-900">
          <div className="flex-shrink-0 bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <LogoIcon className="h-14 w-14 text-orange-500" />
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-1">Castiel Bits</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2">
                <div className="h-1 w-6 bg-orange-500 rounded-full"></div>
                <p className="text-xs text-orange-500 font-mono font-bold tracking-[0.2em] uppercase">High Conversion Intelligence</p>
            </div>
          </div>
          {evolutionConfig.baseUrl && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">WhatsApp Online</span>
            </div>
          )}
        </header>

        <nav className="mb-10 sticky top-4 z-50">
            <div className="flex p-1 bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800 shadow-2xl">
                <button 
                  onClick={() => { setMode('dashboard'); handleReturnHome(); }} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'dashboard' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <ChartBarIcon className="h-4 w-4"/> Dashboard
                </button>
                <button 
                  onClick={() => { setMode('analyzer'); handleReturnHome(); }} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'analyzer' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <TargetIcon className="h-4 w-4"/> Analisar
                </button>
                <button 
                  onClick={() => { setMode('liveCoach'); handleReturnHome(); }} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'liveCoach' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <BrainCircuitIcon className="h-4 w-4"/> Live Coach
                </button>
                <button 
                  onClick={() => { setMode('settings'); handleReturnHome(); }} 
                  className={`flex items-center justify-center px-4 py-3 transition-all rounded-lg ${mode === 'settings' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Configurações e Integração"
                >
                    <SettingsIcon className="h-4 w-4"/>
                </button>
            </div>
        </nav>

        <main className="pb-20">{renderContent()}</main>
        
        <footer className="text-center py-10 border-t border-gray-900">
            <p className="text-[10px] text-gray-700 font-mono uppercase tracking-[0.3em]">Built for performance • {new Date().getFullYear()} Castiel Bits System</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
