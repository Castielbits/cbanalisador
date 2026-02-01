
import React, { useEffect, useState } from 'react';
import { EvolutionConfig, EvolutionChat } from '../types';
import { fetchEvolutionChats, fetchEvolutionMessages } from '../services/evolutionService';
import { LoaderIcon, LinkIcon, TargetIcon } from './icons';

interface ChatSelectorProps {
  config: EvolutionConfig;
  onImport: (content: string) => void;
}

const ChatSelector: React.FC<ChatSelectorProps> = ({ config, onImport }) => {
  const [chats, setChats] = useState<EvolutionChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, [config]);

  const loadChats = async () => {
    if (!config.baseUrl) return;
    setIsLoading(true);
    try {
      const data = await fetchEvolutionChats(config);
      setChats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportChat = async (chatId: string) => {
    setImportingId(chatId);
    try {
      const messages = await fetchEvolutionMessages(config, chatId);
      onImport(messages);
    } catch (err) {
      alert('Erro ao buscar mensagens do chat.');
    } finally {
      setImportingId(null);
    }
  };

  if (!config.baseUrl) return null;

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-5 w-5 text-orange-500" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">WhatsApp Direct Import</h3>
        </div>
        <button onClick={loadChats} className="text-[10px] font-bold text-gray-500 hover:text-orange-500 uppercase transition-all">Atualizar Lista</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoaderIcon className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {chats.map(chat => (
            <div key={chat.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 hover:border-orange-500/30 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-bold text-gray-200 truncate pr-2">{chat.name}</p>
                {chat.unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full font-black">{chat.unreadCount}</span>
                )}
              </div>
              <button
                onClick={() => handleImportChat(chat.id)}
                disabled={!!importingId}
                className="w-full mt-2 py-2 bg-gray-900 group-hover:bg-orange-600 text-[10px] font-black text-gray-500 group-hover:text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {importingId === chat.id ? <LoaderIcon className="h-3 w-3 animate-spin" /> : <TargetIcon className="h-3 w-3" />}
                IMPORTAR PARA ANÁLISE
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <p className="text-center text-xs text-gray-600 col-span-full py-4">Nenhum chat ativo encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatSelector;
