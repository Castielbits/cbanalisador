
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha na requisição');
    }

    if (response.status === 204) return null;
    return response.json();
};
