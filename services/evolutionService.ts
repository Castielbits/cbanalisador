
import { EvolutionConfig, EvolutionChat, EvolutionMessage } from '../types';

const safeFetchJson = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type');

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    throw new Error(`Erro do Servidor (${response.status}): Certifique-se de que a URL e a instância estão corretas.`);
  }

  if (!contentType || !contentType.includes('application/json')) {
    const bodyText = await response.text();
    console.error('Expected JSON but got:', bodyText.substring(0, 100));
    throw new Error('O servidor retornou uma resposta inválida (HTML). Verifique se a URL da Evolution API está correta e não termina em /.');
  }

  return response.json();
};

export const fetchEvolutionChats = async (config: EvolutionConfig): Promise<EvolutionChat[]> => {
  if (!config.baseUrl || !config.instanceName) return [];
  
  try {
    const data = await safeFetchJson(`${config.baseUrl}/chat/findChats/${config.instanceName}`, {
      headers: { 'apikey': config.apiKey }
    });
    
    const chats = Array.isArray(data) ? data : (data.instance?.chats || data.chats || []);
    return chats.map((c: any) => ({
      id: c.id || c.remoteJid,
      name: c.name || c.id || 'Chat sem nome',
      unreadCount: c.unreadCount || 0
    })).slice(0, 15);
  } catch (err: any) {
    console.error('fetchEvolutionChats failure:', err);
    throw err;
  }
};

export const fetchEvolutionMessages = async (config: EvolutionConfig, chatId: string): Promise<string> => {
  if (!config.baseUrl || !config.instanceName) return '';

  try {
    const data = await safeFetchJson(`${config.baseUrl}/chat/findMessages/${config.instanceName}`, {
      method: 'POST',
      headers: { 
        'apikey': config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        where: { remoteJid: chatId },
        take: 20
      })
    });
    
    const messages = Array.isArray(data) ? data : (data.messages || []);
    
    return messages
      .reverse()
      .map((m: any) => {
        const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "[Mídia/Outro]";
        const sender = m.key.fromMe ? "Pedro (Eu)" : (m.pushName || "Prospect");
        return `[${sender}]: ${text}`;
      })
      .join('\n');
  } catch (err: any) {
    console.error('fetchEvolutionMessages failure:', err);
    throw err;
  }
};
