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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("App inicializado. Link da API:", 'https://cbanalisador-api-backend-ia.dc0yb7.easypanel.host');
    const loadData = async () => {
        try {
            const [reports, config] = await Promise.all([
                apiFetch('/api/reports').catch(err => {
                    console.warn("Falha ao carrergar reports", err);
                    return [];
                }),
                apiFetch('/api/config/evolution').catch(err => {
                    console.warn("Falha ao carregar config", err);
                    return null;
                })
            ]);
            
            if (Array.isArray(reports)) setHistory(reports);
            if (config) setEvolutionConfig(config);
        } catch (err) {
            console.error("Erro na inicialização:", err);
        } finally {
            setIsInitialized(true);
        }
    };
    loadData();
  }, []);

  const handleAnalyze = useCallback(async (conversation: string) => {
    if (!conversation.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log("Iniciando análise...");
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
          alert("Configurações salvas!");
      } catch (err) {
          console.error("Erro ao atualizar config:", err);
          alert("Erro ao salvar configurações.");
      }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Apagar histórico?')) {
        try {
            await apiFetch('/api/reports', { method: 'DELETE' });
            setHistory([]);
        } catch (err) {
            console.error(err);
        }
    }
  };

  const renderContent = () => {
    if (!isInitialized) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-orange-500 font-black uppercase tracking-widest text-xs">Sincronizando Sistema...</div>
            </div>
        );
    }

    if (currentReport) return <AnalysisReportComponent report={currentReport} onBack={() => setCurrentReport(null)} />;
    
    switch (mode) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Dashboard history={history} />
             <AnalysisHistory 
                history={history} 
                onViewReport={setCurrentReport} 
                onClearHistory={handleClearHistory}
                onExportHistory={() => {}}
                onImportHistory={() => {}} 
            />
          </div>
        );
      case 'analyzer':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
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
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
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
                <button onClick={() => { setMode('dashboard'); setCurrentReport(null); }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'dashboard' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}><ChartBarIcon className="h-4 w-4"/> Dashboard</button>
                <button onClick={() => { setMode('analyzer'); setCurrentReport(null); }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'analyzer' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}><TargetIcon className="h-4 w-4"/> Analisar</button>
                <button onClick={() => { setMode('liveCoach'); setCurrentReport(null); }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase transition-all rounded-lg ${mode === 'liveCoach' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}><BrainCircuitIcon className="h-4 w-4"/> Live Coach</button>
                <button onClick={() => { setMode('settings'); setCurrentReport(null); }} className={`flex items-center justify-center px-4 py-3 transition-all rounded-lg ${mode === 'settings' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}><SettingsIcon className="h-4 w-4"/></button>
            </div>
        </nav>

        <main className="pb-20">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
