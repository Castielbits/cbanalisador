import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: '#050505', 
      color: 'white', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#f97316' }}>CASTIEL BITS | IA</h1>
      <p>O sistema está carregando...</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '1px solid #333', 
        borderRadius: '10px',
        backgroundColor: '#111'
      }}>
        Se você está vendo esta mensagem, o React está funcionando!
      </div>
    </div>
  );
};

export default App;
