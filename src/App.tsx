import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
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
  SettingsIcon,
  LogoIcon
} from './components/icons';

// Configurações - Pegando das variáveis de ambiente da Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ynolbecdhefndkzgcmia.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_DqoCtTcn4_onDpr9lmUxOA_8XzqP6CY';
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyC4qs9NSHCm_pQ-zAQU9-NFJeSKhqozdyI';

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analisar' | 'historico' | 'config'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisReport | null>(null);
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedHistory: AnalysisReport[] = data.map((item: any) => ({
          ...item.result,
          id: item.id,
          date: item.created_at,
          originalConversation: item.original_conversation
        }));
        setHistory(formattedHistory);
      }
    } catch (e) {
      console.error('Erro ao carregar histórico do Supabase:', e);
      // Fallback para localStorage
      const savedHistory = localStorage.getItem('analysis_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  };

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // 1. Chamar Gemini diretamente (Lógica do AI Studio)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Analise a seguinte conversa de prospecção no WhatsApp e forneça um relatório detalhado em formato JSON.
        
        CONVERSA:
        ${text}
        
        FORMATO DE RESPOSTA (JSON APENAS):
        {
          "overallScore": 0-100,
          "classification": "Fria", "Morna" ou "Quente",
          "nextAction": "Sua recomendação",
          "improvedScript": "O que dizer em seguida",
          "strengths": ["Ponto 1", "Ponto 2"],
          "weaknesses": ["Melhoria 1", "Melhoria 2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text();
      
      // Limpar markdown do JSON
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisResult: AnalysisResult = JSON.parse(responseText);

      const report: AnalysisReport = {
        ...analysisResult,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        originalConversation: text,
      };

      // 2. Salvar no Supabase diretamente
      try {
        await supabase.from('analysis_reports').insert([{
          original_conversation: text,
          result: analysisResult,
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.error('Erro ao salvar no Supabase:', dbErr);
      }

      setCurrentAnalysis(report);
      setHistory([report, ...history]);
      setActiveTab('analisar');
    } catch (err: any) {
      setError(`Erro na análise: ${err.message}`);
      console.error('Erro detalhado:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await supabase.from('analysis_reports').delete().eq('id', id);
      setHistory(history.filter(item => item.id !== id));
    } catch (e) {
      console.error('Erro ao deletar:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
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
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('analisar')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analisar' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Analisar</button>
            <button onClick={() => setActiveTab('historico')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'historico' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>Histórico</button>
            <div className="w-px h-4 bg-white/10 mx-2"></div>
            <button onClick={() => setActiveTab('config')} className={`p-2 rounded-lg transition-all ${activeTab === 'config' ? 'bg-[#ff6b00]/20 text-[#ff6b00]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}><SettingsIcon className="w-5 h-5" /></button>
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

        {activeTab === 'dashboard' && <Dashboard history={history} onAnalyzeClick={() => setActiveTab('analisar')} />}
        {activeTab === 'analisar' && (
          <div className="space-y-8">
            {!currentAnalysis ? <ConversationInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} /> : (
              <div className="space-y-6">
                <button onClick={() => setCurrentAnalysis(null)} className="text-sm text-white/50 hover:text-white flex items-center gap-2 transition-colors">← Nova Análise</button>
                <AnalysisReportView report={currentAnalysis} />
              </div>
            )}
          </div>
        )}
        {activeTab === 'historico' && <AnalysisHistory history={history} onViewReport={(item) => { setCurrentAnalysis(item); setActiveTab('analisar'); }} onDelete={deleteFromHistory} />}
        {activeTab === 'config' && <IntegrationSettings />}
      </main>
    </div>
  );
};

export default App;
