import React, { useState } from 'react';
import { BrainCircuitIcon } from './icons';

interface Props {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const ConversationInput: React.FC<Props> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onAnalyze(text);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom duration-700">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Análise Tática de Conversa</h2>
        <p className="text-white/50 text-sm">Cole abaixo a transcrição da sua conversa do WhatsApp para receber o diagnóstico da IA.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] rounded-3xl blur opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: [10:30] Pedro: Olá, vi seu perfil e notei que seu site..."
            className="relative w-full h-64 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-white placeholder-white/20 focus:outline-none focus:border-[#ff6b00]/50 transition-all resize-none text-sm leading-relaxed"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className={`w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
            !text.trim() || isLoading
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-[#ff6b00] hover:bg-[#ff8c33] text-white shadow-lg shadow-[#ff6b00]/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              PROCESSANDO...
            </>
          ) : (
            <>
              <BrainCircuitIcon className="w-5 h-5" />
              INICIAR ANÁLISE TÁTICA
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ConversationInput;
