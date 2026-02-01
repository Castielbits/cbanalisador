import React, { useState, useEffect } from 'react';
import { 
  AnalysisReport, 
  AnalysisResult 
} from './types';
import Dashboard from './components/Dashboard';
import ConversationInput from './components/ConversationInput';
import AnalysisReportView from './components/AnalysisReport';
import AnalysisHistory from './components/AnalysisHistory';
import IntegrationSettings from './components/IntegrationSettings';
import { 
  ChartBarIcon, 
  TargetIcon, 
  BrainCircuitIcon, 
  SettingsIcon,
  LogoIcon
} from './components/icons';

const API_URL = 'https://cbanalisador-api-backend-ia.dc0yb7.easypanel.host';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analisar' | 'historico' | 'config'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisReport | null>(null);
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('analysis_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }
  }, []);

  const saveToHistory = (analysis: AnalysisReport) => {
    const newHistory = [analysis, ...history];
    setHistory(newHistory);
    localStorage.setItem('analysis_history', JSON.stringify(newHistory));
  };

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/gemini/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro na análise');
      }

      const result: AnalysisResult = await response.json();
      const report: AnalysisReport = {
        ...result,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        originalConversation: text,
      };

      setCurrentAnalysis(report);
      saveToHistory(report);
      setActiveTab('analisar');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado');
      console.error('Erro na análise:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('analysis_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff6b00]/20">
              <LogoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">Castiel Bits</h1>
              <p className="text-[10px] text-[#ff6b00] font-bold tracking-[0.2em] uppercase">IA Prospecting System</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('analisar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analisar' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              Analisar
            </button>
            <button 
              onClick={() => setActiveTab('historico')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'historico' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              Histórico
            </button>
            <div className="w-px h-4 bg-white/10 mx-2"></div>
            <button 
              onClick={() => setActiveTab('config')}
              className={`p-2 rounded-lg transition-all ${activeTab === 'config' ? 'bg-[#ff6b00]/20 text-[#ff6b00]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {error}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard history={history} onAnalyzeClick={() => setActiveTab('analisar')} />
        )}

        {activeTab === 'analisar' && (
          <div className="space-y-8">
            {!currentAnalysis ? (
              <ConversationInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setCurrentAnalysis(null)}
                    className="text-sm text-white/50 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    ← Nova Análise
                  </button>
                </div>
                <AnalysisReportView report={currentAnalysis} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'historico' && (
          <AnalysisHistory 
            history={history} 
            onViewReport={(item) => {
              setCurrentAnalysis(item);
              setActiveTab('analisar');
            }}
            onDelete={deleteFromHistory}
          />
        )}

        {activeTab === 'config' && (
          <IntegrationSettings />
        )}
      </main>
    </div>
  );
};

export default App;
