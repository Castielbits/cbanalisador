
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, LiveSuggestion } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

Sua tarefa é analisar a conversa de prospecção fornecida, considerando o contexto de negócio da Castiel Bits. A análise deve ser precisa, acionável e estruturada.

Avalie a conversa com base nos seguintes critérios e forneça uma pontuação de 0 a 20 para cada um:
1.  **Personalização (0-20 pts):** A abordagem foi genérica ou personalizada? O nome do prospect foi usado? Houve menção a detalhes específicos (avaliações, Instagram, site)? A pesquisa prévia é evidente?
2.  **Proposta de Valor (0-20 pts):** O problema do prospect foi claramente identificado? O valor foi comunicado em termos de resultados para o cliente (ex: mais pacientes, autoridade online) e não apenas em features (ex: site rápido)? Houve uso de prova social ou demonstração de autoridade?
3.  **Timing & Follow-up (0-20 pts):** O momento da abordagem foi adequado? Os follow-ups (se houver) agregaram valor ou foram apenas cobranças? O senso de urgência foi balanceado e não agressivo?
4.  **CTA - Call to Action (0-20 pts):** O CTA foi claro e específico? Foi uma ação de baixo atrito (ex: "posso te enviar 2 exemplos?")? Permitiu uma saída elegante para o prospect?
5.  **Gestão de Objeções (0-20 pts):** Como o vendedor lidou com silêncio, resistência ou objeções diretas? A postura foi consultiva? Soube quando recuar e quando persistir?

Com base na sua avaliação, gere um JSON com a seguinte estrutura:
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: "A pontuação geral de 0 a 100, calculada como a soma das pontuações dos 5 critérios do scorecard."
        },
        scorecard: {
            type: Type.OBJECT,
            properties: {
                personalizacao: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "Pontuação de 0-20 para Personalização." },
                        feedback: { type: Type.STRING, description: "Justificativa concisa para a pontuação de Personalização." }
                    },
                    required: ["score", "feedback"]
                },
                propostaDeValor: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "Pontuação de 0-20 para Proposta de Valor." },
                        feedback: { type: Type.STRING, description: "Justificativa concisa para a pontuação de Proposta de Valor." }
                    },
                     required: ["score", "feedback"]
                },
                timingFollowUp: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "Pontuação de 0-20 para Timing & Follow-up." },
                        feedback: { type: Type.STRING, description: "Justificativa concisa para a pontuação de Timing & Follow-up." }
                    },
                     required: ["score", "feedback"]
                },
                cta: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "Pontuação de 0-20 para CTA." },
                        feedback: { type: Type.STRING, description: "Justificativa concisa para a pontuação de CTA." }
                    },
                     required: ["score", "feedback"]
                },
                gestaoObjecoes: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER, description: "Pontuação de 0-20 para Gestão de Objeções." },
                        feedback: { type: Type.STRING, description: "Justificativa concisa para a pontuação de Gestão de Objeções." }
                    },
                     required: ["score", "feedback"]
                },
            },
            required: ["personalizacao", "propostaDeValor", "timingFollowUp", "cta", "gestaoObjecoes"]
        },
        classification: {
            type: Type.STRING,
            description: "Classifique o resultado da conversa em uma das seguintes categorias: 'Oportunidade Quente', 'Nutrir Relacionamento', 'Tentativa Válida (Perdido)', 'Abordagem a Melhorar'."
        },
        whatWentWell: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de 3 a 5 pontos positivos que funcionaram bem na conversa."
        },
        whatToImprove: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de 3 a 5 pontos acionáveis que podem ser melhorados na abordagem."
        },
        suggestedNextAction: {
            type: Type.STRING,
            description: "Sugestão de uma próxima ação específica e acionável (ex: 'Envie um case de sucesso de um nutricionista e faça follow-up em 3 dias.'). Se a conversa foi perdida, sugira uma reflexão."
        },
        improvedScript: {
            type: Type.STRING,
            description: "Reescreva a principal mensagem de abordagem ou a resposta a uma objeção com uma versão otimizada, pronta para ser copiada e colada."
        },
    },
    required: ["overallScore", "scorecard", "classification", "whatWentWell", "whatToImprove", "suggestedNextAction", "improvedScript"]
};

const liveCoachInstructions = `
Você é um "Live Coach" de vendas, um especialista tático que fornece conselhos rápidos e acionáveis durante uma conversa de prospecção ativa no WhatsApp. Sua missão é ajudar o vendedor (Pedro Castiel) a maximizar as chances de conversão em tempo real.

Analise a última mensagem do prospect no contexto da conversa até agora e do negócio da Castiel Bits. Forneça uma resposta JSON estruturada e direta ao ponto. Seja rápido, tático e estratégico.

O JSON deve ter a seguinte estrutura:
`;

const liveSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        signal: {
            type: Type.STRING,
            description: "Identifique o sinal principal na mensagem do prospect. Seja conciso. Ex: 'Sinal de Interesse com Objeção de Custo', 'Sinal de Desinteresse', 'Pedido de Informação Técnica', 'Sinal de Compra Iminente'."
        },
        suggestedResponse: {
            type: Type.STRING,
            description: "Escreva a resposta exata que Pedro deve enviar. A resposta deve ser profissional, empática e estrategicamente desenhada para avançar a conversa. Use quebras de linha (\\n) para formatação."
        },
        nextAction: {
            type: Type.STRING,
            description: "Descreva a próxima ação tática que Pedro deve tomar imediatamente após enviar a resposta. Ex: 'Aguarde a resposta. Se não houver retorno em 48h, faça um follow-up com o case da Clínica X.' ou 'Adicione a etiqueta 'Acompanhar' no WhatsApp e agende um lembrete para a próxima semana.'"
        }
    },
    required: ["signal", "suggestedResponse", "nextAction"]
};

export const analyzeConversation = async (conversation: string): Promise<AnalysisResult> => {
    const prompt = `${analysisInstructions}\n\nCONTEXTO DE NEGÓCIO:\n${businessContext}\n\nCONVERSA PARA ANÁLISE:\n\`\`\`\n${conversation}\n\`\`\``;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("A IA não retornou nenhum conteúdo.");
        }
        
        try {
            return JSON.parse(text.trim()) as AnalysisResult;
        } catch (parseError) {
            console.error("JSON Parse Error:", text);
            throw new Error("A resposta da IA não é um JSON válido.");
        }

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        throw new Error(error.message || "Falha ao obter análise da IA.");
    }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    try {
        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType,
            },
        };
        const textPart = {
            text: "Transcreva este áudio em português de forma literal:",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [audioPart, textPart] },
        });

        if (!response.text) {
            throw new Error("A IA não retornou uma transcrição.");
        }
        return response.text;
    } catch (error: any) {
        console.error("Error calling Gemini API for transcription:", error);
        throw new Error("Falha ao transcrever o áudio.");
    }
};

export const getLiveSuggestion = async (conversationHistory: string, prospectMessage: string): Promise<LiveSuggestion> => {
    const prompt = `
${liveCoachInstructions}

CONTEXTO DE NEGÓCIO:
${businessContext}

HISTÓRICO DA CONVERSA ATÉ AGORA:
\`\`\`
${conversationHistory}
\`\`\`

ÚLTIMA MENSAGEM DO PROSPECT (para a qual você deve sugerir uma resposta):
\`\`\`
${prospectMessage}
\`\`\`
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: liveSuggestionSchema,
                temperature: 0.7,
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("A IA não retornou uma sugestão.");
        }
        
        try {
            return JSON.parse(text.trim()) as LiveSuggestion;
        } catch (parseError) {
            console.error("JSON Parse Error:", text);
            throw new Error("A resposta da IA para o Live Coach é inválida.");
        }

    } catch (error: any) {
        console.error("Error calling Gemini API for live suggestion:", error);
        throw new Error(error.message || "Falha ao obter sugestão tática.");
    }
};
