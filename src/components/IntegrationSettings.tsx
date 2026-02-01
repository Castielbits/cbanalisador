
import React, { useState } from 'react';
import { EvolutionConfig } from '../types';
import { SettingsIcon, CheckCircleIcon, LoaderIcon } from './icons';

interface IntegrationSettingsProps {
  config: EvolutionConfig;
  onUpdate: (config: EvolutionConfig) => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ config, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Limpeza básica da URL
    let baseUrl = localConfig.baseUrl.trim();
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    try {
      const response = await fetch(`${baseUrl}/instance/fetchInstances`, {
        headers: { 'apikey': localConfig.apiKey }
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: API Key ou URL incorreta.`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('A URL informada não parece ser de uma Evolution API válida (retornou HTML).');
      }

      const data = await response.json();
      setTestResult({ success: true, message: 'Conexão estabelecida com sucesso!' });
      onUpdate({ ...localConfig, baseUrl });
    } catch (err: any) {
      console.error('Test connection error:', err);
      setTestResult({ 
        success: false, 
        message: err.message || 'Erro ao conectar. Verifique a URL e a API Key.' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
          <SettingsIcon className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">WhatsApp Integration</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Evolution API Bridge</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Base URL do Servidor</label>
          <input
            type="text"
            className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
            placeholder="https://api.seuservidor.com"
            value={localConfig.baseUrl}
            onChange={e => setLocalConfig({...localConfig, baseUrl: e.target.value})}
          />
          <p className="text-[9px] text-gray-600 mt-1 uppercase">Não inclua a barra (/) no final.</p>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Global API Key</label>
          <input
            type="password"
            className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
            placeholder="Sua Global API Key"
            value={localConfig.apiKey}
            onChange={e => setLocalConfig({...localConfig, apiKey: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-600 mb-2 block tracking-widest">Nome da Instância</label>
          <input
            type="text"
            className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
            placeholder="Ex: CastielBits_Sales"
            value={localConfig.instanceName}
            onChange={e => setLocalConfig({...localConfig, instanceName: e.target.value})}
          />
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${testResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {testResult.success ? <CheckCircleIcon className="h-5 w-5 flex-shrink-0" /> : null}
            <span className="leading-tight">{testResult.message}</span>
          </div>
        )}

        <button
          onClick={handleTest}
          disabled={isTesting}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg"
        >
          {isTesting ? <LoaderIcon className="animate-spin h-5 w-5" /> : <SettingsIcon className="h-5 w-5" />}
          {isTesting ? 'Validando Conexão...' : 'Salvar e Testar Integração'}
        </button>
      </div>
    </div>
  );
};

export default IntegrationSettings;
