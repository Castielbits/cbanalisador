import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("ERRO CRÍTICO: Elemento root não encontrado!");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React montado com sucesso!");
  } catch (error) {
    console.error("ERRO AO MONTAR O REACT:", error);
    rootElement.innerHTML = `<div style="color: white; padding: 20px; background: red;"><h1>Erro ao carregar o App</h1><pre>${error}</pre></div>`;
  }
}
