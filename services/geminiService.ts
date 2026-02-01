
import { AnalysisResult, LiveSuggestion } from '../types';
import { apiFetch } from './apiService';

const businessContext = `
Empresa: Castiel Bits - Desenvolvimento Web
Fundador: Pedro Castiel
Serviço: Sites de alta conversão para profissionais da saúde
Nicho: Nutricionistas, psicólogos, fisioterapeutas, clínicas estéticas
Região: Salvador, Bahia
Ticket médio: R$ 3.500 (completo) | R$ 800 (simplificado)
Meta: 1-2 clientes/mês consistentes
Canal: WhatsApp Business (prospecção ativa)

Abordagem de Prospecção Padrão:
1. Saudação personalizada
2. Identificação + especialidade
3. Gancho de autoridade (elogio/dado específico)
4. Diagnóstico (problema técnico real)
5. CTA (oferta sem compromisso)

Etiquetas do WhatsApp Business:
- Lead (inicial)
- Acompanhar (interesse, nutrição)
- Novo pedido (orçamento solicitado)
- Importante (alta conversão)
- Pedido finalizado (projeto fechado)
`;

const analysisInstructions = `
Você é um assistente especialista em vendas e prospecção B2B, focado em analisar conversas do WhatsApp para otimizar a conversão para a empresa Castiel Bits.
Avalie a conversa com base nos seguintes critérios e forneça uma pontuação de 0 a 20 para cada um: Personalização, Proposta de Valor, Timing & Follow-up, CTA, Gestão de Objeções.
`;

const responseSchema = {
    type: "object",
    properties: {
        overallScore: { type: "integer" },
        scorecard: {
            type: "object",
            properties: {
                personalizacao: { type: "object", properties: { score: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "feedback"] },
                propostaDeValor: { type: "object", properties: { score: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "feedback"] },
                timingFollowUp: { type: "object", properties: { score: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "feedback"] },
                cta: { type: "object", properties: { score: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "feedback"] },
                gestaoObjecoes: { type: "object", properties: { score: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "feedback"] }
            },
            required: ["personalizacao", "propostaDeValor", "timingFollowUp", "cta", "gestaoObjecoes"]
        },
        classification: { type: "string" },
        whatWentWell: { type: "array", items: { type: "string" } },
        whatToImprove: { type: "array", items: { type: "string" } },
        suggestedNextAction: { type: "string" },
        improvedScript: { type: "string" }
    },
    required: ["overallScore", "scorecard", "classification", "whatWentWell", "whatToImprove", "suggestedNextAction", "improvedScript"]
};

const liveSuggestionSchema = {
    type: "object",
    properties: {
        signal: { type: "string" },
        suggestedResponse: { type: "string" },
        nextAction: { type: "string" }
    },
    required: ["signal", "suggestedResponse", "nextAction"]
};

export const analyzeConversation = async (conversation: string): Promise<AnalysisResult> => {
    const prompt = `${analysisInstructions}\n\nCONTEXTO DE NEGÓCIO:\n${businessContext}\n\nCONVERSA PARA ANÁLISE:\n\`\`\`\n${conversation}\n\`\`\``;
    return apiFetch('/api/gemini/analyze', {
        method: 'POST',
        body: JSON.stringify({ prompt, responseSchema })
    });
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const result = await apiFetch('/api/gemini/transcribe', {
        method: 'POST',
        body: JSON.stringify({ audioBase64, mimeType })
    });
    return result.text;
};

export const getLiveSuggestion = async (conversationHistory: string, prospectMessage: string): Promise<LiveSuggestion> => {
    const prompt = `Analise a última mensagem do prospect no contexto da conversa e do negócio da Castiel Bits. Forneça uma resposta JSON direta.\n\nCONTEXTO:\n${businessContext}\n\nHISTÓRICO:\n${conversationHistory}\n\nÚLTIMA MENSAGEM:\n${prospectMessage}`;
    return apiFetch('/api/gemini/live-suggestion', {
        method: 'POST',
        body: JSON.stringify({ prompt, responseSchema: liveSuggestionSchema })
    });
};
