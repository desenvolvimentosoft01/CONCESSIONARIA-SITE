'use client';

import { useEffect } from 'react';

interface ToastProps {
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'aviso';
  onClose: () => void;
  duracao?: number;
}

export default function Toast({ mensagem, tipo, onClose, duracao = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duracao);
    return () => clearTimeout(timer);
  }, [duracao, onClose]);

  const cores = {
    sucesso: { bg: '#28a745', icon: '✅' },
    erro: { bg: '#dc3545', icon: '❌' },
    aviso: { bg: '#ffc107', icon: '⚠️' }
  };

  const estilo = cores[tipo];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{...styles.toast, backgroundColor: estilo.bg}} onClick={(e) => e.stopPropagation()}>
        <span style={styles.icon}>{estilo.icon}</span>
        <span style={styles.mensagem}>{mensagem}</span>
        <button onClick={onClose} style={styles.botaoFechar}>✕</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    animation: 'fadeIn 0.2s ease-in-out'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px 30px',
    borderRadius: '10px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    animation: 'slideDown 0.3s ease-out'
  },
  icon: {
    fontSize: '24px'
  },
  mensagem: {
    flex: 1
  },
  botaoFechar: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 5px',
    opacity: 0.8
  }
};
