import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisReport, EvolutionConfig } from './types';
import { analyzeConversation } from './services/geminiService';
import { apiFetch } from './services/apiService';
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
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({
    baseUrl: '',
    apiKey: '',
    instanceName: ''
  });
  
  const [currentReport, setCurrentReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('dashboard');

  // Carregar dados iniciais com "Escudo" contra erros críticos
  useEffect(() => {
    const loadData = async () => {
        try {
            console.log("Tentando carregar dados iniciais...");
            const [reports, config] = await Promise.all([
                apiFetch('/api/reports').catch(e => { console.warn("Falha ao carregar relatórios:", e); return []; }),
                apiFetch('/api/config/evolution').catch(e => { console.warn("Falha ao carregar config:", e); return null; })
            ]);
            
            if (reports) setHistory(reports);
            if (config) setEvolutionConfig(config);
            console.log("Dados carregados com sucesso (ou ignorados com segurança)");
        } catch (err) {
            console.error("ERRO NO USEEFFECT:", err);
            // Não deixa a tela ficar preta, apenas loga o erro
        }
    };
    loadData();
  }, []);

  const handleAnalyze = useCallback(async (conversation: string) => {
    if (!conversation.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeConversation(conversation);
      const reportData = {
        ...result,
        original_conversation: conversation,
      };
      
      const savedReport = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify(reportData)
      });

      setHistory(prev => [savedReport, ...prev]);
      setCurrentReport(savedReport);
      setMode('analyzer');
    } catch (err: any) {
      console.error("Erro na análise:", err);
      setError(err.message || 'Falha ao analisar a conversa.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateConfig = async (newConfig: EvolutionConfig) => {
      try {
          await apiFetch('/api/config/evolution', {
              method: 'POST',
              body: JSON.stringify(newConfig)
          });
          setEvolutionConfig(newConfig);
      } catch (err) {
          console.error("Erro ao atualizar config:", err);
          alert("Erro ao salvar configurações.");
      }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Apagar todo o histórico permanentemente no banco de dados?')) {
        try {
            await apiFetch('/api/reports', { method: 'DELETE' });
            setHistory([]);
        } catch (err) {
            console.error("Erro ao limpar histórico:", err);
        }
    }
  };

  const handleExportHistory = () => {
      if (history.length === 0) return alert("Histórico vazio.");
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-cbanalisador-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
  };

  const renderContent = () => {
    if (currentReport) return <AnalysisReportComponent report={currentReport} onBack={() => setCurrentReport(null)} />;
    
    switch (mode) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-fade-in">
             <Dashboard history={history} />
             <AnalysisHistory 
                history={history} 
                onViewReport={setCurrentReport} 
                onClearHistory={handleClearHistory}
                onExportHistory={handleExportHistory}
                onImportHistory={() => {}} 
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
        return <IntegrationSettings config={evolutionConfig} onUpdate={handleUpdateConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center gap-6 mb-10 py-6 border-b border-gray-900">
          <div className="flex-shrink-0 bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20">
            <LogoIcon className="h-14 w-14 text-orange-500" />
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-1">Castiel Bits</h1>
            <p className="text-xs text-orange-500 font-mono font-bold tracking-[0.2em] uppercase">High Conversion Intelligence</p>
          </div>
        </header>

        <nav className="mb-10 sticky top-4 z-50">
            <div className="flex p-1 bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800 shadow-2xl">
                <button onClick={() => { setMode('dashboard'); setCurrentReport(null); }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'dashboard' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}><ChartBarIcon className="h-4 w-4"/> Dashboard</button>
                <button onClick={() => { setMode('analyzer'); setCurrentReport(null); }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'analyzer' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}><TargetIcon className="h-4 w-4"/> Analisar</button>
                <button onClick={() => { setMode('liveCoach'); setCurrentReport(null); }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'liveCoach' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}><BrainCircuitIcon className="h-4 w-4"/> Live Coach</button>
                <button onClick={() => { setMode('settings'); setCurrentReport(null); }} className={`flex items-center justify-center px-4 py-3 transition-all rounded-lg ${mode === 'settings' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}><SettingsIcon className="h-4 w-4"/></button>
            </div>
        </nav>

        <main className="pb-20">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
