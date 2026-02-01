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
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.1' });
});

// Inicialização do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Inicialização do Google GenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Rotas de Relatórios de Análise ---

// Buscar todos os relatórios
app.get('/api/reports', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('analysis_reports')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: error.message });
    }
});

// Salvar um novo relatório
app.post('/api/reports', async (req, res) => {
    try {
        const reportData = req.body;
        const { data, error } = await supabase
            .from('analysis_reports')
            .insert([reportData])
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: error.message });
    }
});

// Limpar todo o histórico
app.delete('/api/reports', async (req, res) => {
    try {
        const { error } = await supabase
            .from('analysis_reports')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo
        
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Rotas de Configuração ---

// Buscar configuração da Evolution API
app.get('/api/config/evolution', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_configs')
            .select('config_data')
            .eq('config_name', 'evolution_api_config')
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // Ignora se não encontrar
        res.json(data ? data.config_data : null);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: error.message });
    }
});

// Atualizar configuração da Evolution API
app.post('/api/config/evolution', async (req, res) => {
    try {
        const configData = req.body;
        const { data, error } = await supabase
            .from('user_configs')
            .upsert({ 
                config_name: 'evolution_api_config', 
                config_data: configData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'config_name' })
            .select();
        
        if (error) throw error;
        res.json(data[0].config_data);
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Rotas da API Gemini (Proxy) ---

// Analisar conversa
app.post('/api/gemini/analyze', async (req, res) => {
    try {
        const { prompt, responseSchema } = req.body;
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json(JSON.parse(response.text()));
    } catch (error) {
        console.error('Error in analyze:', error);
        res.status(500).json({ error: error.message });
    }
});

// Transcrever áudio
app.post('/api/gemini/transcribe', async (req, res) => {
    try {
        const { audioBase64, mimeType } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType,
            },
        };
        const textPart = {
            text: "Transcreva este áudio em português de forma literal:",
        };
        
        const result = await model.generateContent({ contents: [{ parts: [audioPart, textPart] }] });
        const response = await result.response;
        res.json({ text: response.text() });
    } catch (error) {
        console.error('Error in transcribe:', error);
        res.status(500).json({ error: error.message });
    }
});

// Sugestão Live Coach
app.post('/api/gemini/live-suggestion', async (req, res) => {
    try {
        const { prompt, responseSchema } = req.body;
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json(JSON.parse(response.text()));
    } catch (error) {
        console.error('Error in live-suggestion:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
