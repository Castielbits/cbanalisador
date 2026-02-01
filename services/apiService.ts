
const API_URL = 'https://cbanalisador-api-backend.dc0yb7.easypanel.host';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        // Tenta ler o erro como JSON, se falhar, retorna o texto do erro
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || 'Falha na requisição');
        } catch (e) {
            throw new Error(`Erro no servidor (${response.status}): ${errorText.substring(0, 100)}`);
        }
    }

    if (response.status === 204) return null;
    return response.json();
};
