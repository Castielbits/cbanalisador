
import React, { useState } from 'react';
import { getLiveSuggestion } from '../services/geminiService';
import { LiveSuggestion } from '../types';
import { BrainCircuitIcon, ReplyIcon, TargetIcon, LoaderIcon, ClipboardIcon } from './icons';

const LiveCoach: React.FC = () => {
    const [conversationHistory, setConversationHistory] = useState('');
    const [prospectMessage, setProspectMessage] = useState('');
    const [intent, setIntent] = useState('contorno_objecao');
    const [suggestion, setSuggestion] = useState<LiveSuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleGetSuggestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prospectMessage.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setSuggestion(null);
        try {
            // Passamos a intenção como contexto adicional
            const contextualProspectMessage = `[OBJETIVO: ${intent.toUpperCase()}] ${prospectMessage}`;
            const result = await getLiveSuggestion(conversationHistory, contextualProspectMessage);
            setSuggestion(result);
        } catch (err) {
            setError("Falha ao obter sugestão estratégica.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        if(suggestion?.suggestedResponse) {
            navigator.clipboard.writeText(suggestion.suggestedResponse.replace(/\\n/g, '\n'));
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <section className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                        <BrainCircuitIcon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Copiloto Tático</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Assistência em Tempo Real</p>
                    </div>
                </div>

                <form onSubmit={handleGetSuggestion} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-[0.1em]">Qual seu objetivo agora?</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    {id: 'saudacao', label: 'Início/Saudação'},
                                    {id: 'diagnostico', label: 'Diagnóstico'},
                                    {id: 'contorno_objecao', label: 'Contornar Objeção'},
                                    {id: 'fechamento', label: 'Pedido de Orçamento/Fechamento'}
                                ].map(opt => (
                                    <button 
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setIntent(opt.id)}
                                        className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${intent === opt.id ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-[0.1em]">Última Mensagem do Prospect</label>
                            <textarea
                                className="w-full h-24 p-4 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all placeholder-gray-700 text-sm"
                                placeholder="O que o cliente disse por último?"
                                value={prospectMessage}
                                onChange={(e) => setProspectMessage(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 text-xs font-bold">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading || !prospectMessage.trim()}
                        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl disabled:bg-gray-800 disabled:text-gray-600 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-orange-900/20"
                    >
                        {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : <TargetIcon className="h-5 w-5" />}
                        {isLoading ? "Processando..." : "Gerar Resposta de Alta Conversão"}
                    </button>
                </form>
            </div>

            {suggestion && (
                <div className="space-y-4 animate-slide-up">
                    <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/20">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <ReplyIcon className="h-5 w-5 text-orange-500"/>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Resposta Sugerida</h3>
                            </div>
                            <button onClick={handleCopyToClipboard} className="text-[10px] font-black uppercase text-orange-500 hover:text-white transition-colors">
                                {copySuccess ? 'Copiado!' : 'Copiar Texto'}
                            </button>
                        </div>
                        <div className="bg-gray-950/80 p-5 rounded-xl border border-gray-800 text-gray-200 text-base leading-relaxed whitespace-pre-wrap font-medium">
                            {suggestion.suggestedResponse.replace(/\\n/g, '\n')}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Análise do Sinal</h4>
                             <p className="text-sm font-bold text-orange-400">{suggestion.signal}</p>
                        </div>
                        <div className="bg-gray-900/50 p-5 rounded-2xl border border-gray-800">
                             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ação Recomendada</h4>
                             <p className="text-sm text-gray-400">{suggestion.nextAction}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default LiveCoach;
