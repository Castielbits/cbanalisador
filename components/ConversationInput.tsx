
import React, { useState, useRef } from 'react';
import { AnalyzeIcon, LoaderIcon, UploadIcon, MicrophoneIcon, LinkIcon } from './icons';
import { transcribeAudio } from '../services/geminiService';


interface ConversationInputProps {
  onAnalyze: (conversation: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ConversationInput: React.FC<ConversationInputProps> = ({ onAnalyze, isLoading, error }) => {
  const [conversation, setConversation] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conversation.trim() && !isLoading && !isTranscribing) {
      onAnalyze(conversation);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleAudioImportClick = () => {
    audioInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setConversation(text);
      };
      reader.readAsText(file);
    } else if (file) {
        alert("Por favor, selecione um arquivo de texto (.txt).");
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    if (!supportedTypes.includes(file.type)) {
        alert(`Formato de áudio não suportado: ${supportedTypes.join(', ')}`);
        if (e.target) e.target.value = '';
        return;
    }
    
    setIsTranscribing(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const dataUrl = reader.result as string;
            const base64Data = dataUrl.split(',')[1];
            const transcribedText = await transcribeAudio(base64Data, file.type);
            setConversation(prev => `${prev}\n\n[Áudio Transcrito - ${file.name}]:\n${transcribedText}\n`);
        };
        reader.onerror = () => {
            throw new Error("Falha ao ler o áudio.");
        };
    } catch (err) {
        console.error(err);
        alert("Erro na transcrição. Tente novamente.");
    } finally {
        setIsTranscribing(false);
    }

    if (e.target) {
        e.target.value = '';
    }
  };


  return (
    <section className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-800 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <AnalyzeIcon className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Manual Analysis</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Input de Dados Estratégicos</p>
          </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt" />
        <input type="file" ref={audioInputRef} onChange={handleAudioFileChange} className="hidden" accept="audio/*" />
        <textarea
          className="w-full h-48 p-6 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder-gray-700 resize-y outline-none text-sm leading-relaxed"
          placeholder="Cole aqui a conversa do WhatsApp ou importe um arquivo .txt / .mp3..."
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          disabled={isLoading || isTranscribing}
        />
        {error && <p className="text-red-400 mt-2 text-xs font-bold uppercase">{error}</p>}
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
                type="button"
                onClick={handleImportClick}
                disabled={isLoading || isTranscribing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-800 text-white font-black rounded-xl hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-700 transition-all uppercase tracking-widest text-[10px]"
            >
                <UploadIcon className="h-5 w-5" /> Importar TXT
            </button>
             <button
                type="button"
                onClick={handleAudioImportClick}
                disabled={isLoading || isTranscribing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-600/10 text-orange-500 border border-orange-500/20 font-black rounded-xl hover:bg-orange-600/20 disabled:bg-gray-900 disabled:text-gray-700 transition-all uppercase tracking-widest text-[10px]"
            >
                {isTranscribing ? <LoaderIcon className="animate-spin h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                {isTranscribing ? "Processando Áudio..." : "Importar Áudio"}
            </button>
            <button
              type="submit"
              disabled={isLoading || isTranscribing || !conversation.trim()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-500 disabled:bg-gray-900 disabled:text-gray-700 transition-all uppercase tracking-widest text-[10px] shadow-xl shadow-orange-900/10"
            >
              {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : <AnalyzeIcon className="h-5 w-5" />}
              {isLoading ? "Processando IA..." : "Iniciar Análise Tática"}
            </button>
        </div>
      </form>
    </section>
  );
};

export default ConversationInput;
