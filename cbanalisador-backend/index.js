require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Configuração do CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rota de Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(), 
        version: '1.0.5',
        env_check: {
            has_gemini: !!process.env.GEMINI_API_KEY,
            has_supabase_url: !!process.env.SUPABASE_URL,
            has_supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
    });
});

// Inicialização do Supabase
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

// Inicialização do Google GenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- Rotas da API Gemini (Proxy) ---

app.post('/api/gemini/analyze', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in server environment");
        
        const conversation = req.body.conversation || (req.body.contents?.[0]?.parts?.[0]?.text) || req.body.prompt;
        
        if (!conversation) {
            return res.status(400).json({ error: 'Nenhuma conversa ou prompt fornecido' });
        }

        // USANDO O NOME OFICIAL E ESTÁVEL DO MODELO
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash' 
        });

        const finalPrompt = req.body.prompt || `
            Analise a seguinte conversa de prospecção no WhatsApp e forneça um relatório detalhado em formato JSON.
            
            CONVERSA:
            ${conversation}
            
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
        
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        let text = response.text();
        
        // Limpar markdown do JSON se necessário
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.json(JSON.parse(text));
    } catch (error) {
        console.error('Error in analyze:', error);
        res.status(500).json({ error: `Gemini API Error: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Backend v1.0.5 running on port ${port}`);
});
