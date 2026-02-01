const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/reports', async (req, res) => {
    const { data } = await supabase.from('analysis_reports').select('*').order('created_at', { ascending: false });
    res.json(data || []);
});

app.post('/api/reports', async (req, res) => {
    const { data } = await supabase.from('analysis_reports').insert([req.body]).select();
    res.json(data ? data[0] : { error: 'Erro ao salvar' });
});

app.post('/api/gemini/analyze', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Limpa possíveis marcações de markdown do JSON
        const cleanJson = text.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanJson));
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: e.message }); 
    }
});

app.listen(3001, '0.0.0.0', () => console.log('SERVIDOR ONLINE NA 3001'));
