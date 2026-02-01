import React, { useState, useEffect } from 'react';

// --- CONFIGURAÇÃO DA API ---
const API_URL = 'https://cbanalisador-api-backend-ia.dc0yb7.easypanel.host';

// --- COMPONENTES ---

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'analyzer'>('dashboard');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [report, setReport] = useState<any | null>(null);

  // Carregar histórico ao iniciar
  useEffect(() => {
    fetch(`${API_URL}/api/reports`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erro ao carregar histórico:", err));
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      // 1. Analisar
      const res = await fetch(`${API_URL}/api/gemini/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Analise esta conversa de prospecção para a Castiel Bits:\n\n${text}`,
          responseSchema: {
            type: "object",
            properties: {
              overallScore: { type: "integer" },
              classification: { type: "string" },
              improvedScript: { type: "string" },
              suggestedNextAction: { type: "string" }
            },
            required: ["overallScore", "classification", "improvedScript", "suggestedNextAction"]
          }
        })
      });
      const result = await res.json();

      // 2. Salvar
      const saveRes = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result, original_conversation: text })
      });
      const savedData = await saveRes.json();

      setHistory([savedData, ...history]);
      setReport(savedData);
    } catch (err) {
      alert("Erro na análise. Verifique o console.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center font-black text-2xl">CB</div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Castiel Bits</h1>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">IA Prospecting System</p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex gap-2 mb-8 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button 
            onClick={() => { setView('dashboard'); setReport(null); }}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${view === 'dashboard' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => { setView('analyzer'); setReport(null); }}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${view === 'analyzer' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}
          >
            Analisar
          </button>
        </nav>

        {/* Content */}
        <main>
          {report ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-in fade-in duration-500">
              <button onClick={() => setReport(null)} className="text-orange-500 text-xs font-bold mb-4 uppercase">← Voltar</button>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-black text-orange-500">{report.overallScore}</div>
                <div>
                  <div className="text-xl font-bold">{report.classification}</div>
                  <div className="text-xs text-gray-500">Pontuação Geral</div>
                </div>
              </div>
              <div className="space-y-6">
                <section>
                  <h3 className="text-orange-500 text-xs font-black uppercase mb-2">Próxima Ação Sugerida</h3>
                  <p className="bg-gray-800 p-4 rounded-xl text-sm italic">"{report.suggestedNextAction}"</p>
                </section>
                <section>
                  <h3 className="text-orange-500 text-xs font-black uppercase mb-2">Script Melhorado</h3>
                  <pre className="bg-black p-4 rounded-xl text-sm whitespace-pre-wrap border border-gray-800 text-gray-300">{report.improvedScript}</pre>
                </section>
              </div>
            </div>
          ) : view === 'dashboard' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                  <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Total Analisado</div>
                  <div className="text-3xl font-black">{history.length}</div>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                  <div className="text-gray-500 text-[10px] font-bold uppercase mb-1">Média de Score</div>
                  <div className="text-3xl font-black">
                    {history.length > 0 ? Math.round(history.reduce((a,b) => a + b.overallScore, 0) / history.length) : 0}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 font-bold text-xs uppercase text-gray-500">Histórico Recente</div>
                <div className="divide-y divide-gray-800">
                  {history.length > 0 ? history.map((item, i) => (
                    <div key={i} onClick={() => setReport(item)} className="p-4 hover:bg-gray-800 cursor-pointer transition-all flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm">{item.classification}</div>
                        <div className="text-[10px] text-gray-500">{new Date(item.created_at || Date.now()).toLocaleDateString()}</div>
                      </div>
                      <div className="text-orange-500 font-black text-xl">{item.overallScore}</div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-gray-600 text-sm">Nenhuma análise encontrada.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole aqui a conversa do WhatsApp..."
                className="w-full h-64 bg-gray-900 border border-gray-800 rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all"
              />
              <button 
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${loading ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'}`}
              >
                {loading ? 'Analisando...' : 'Iniciar Análise Tática'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
