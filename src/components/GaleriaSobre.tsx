'use client';

import { useState } from 'react';

interface GaleriaSobreProps {
  midias: any[];
}

export default function GaleriaSobre({ midias }: GaleriaSobreProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  if (midias.length === 0) {
    return (
      <div style={styles.placeholder}>
        <span style={styles.placeholderTexto}>🚗 Adicione imagens no admin</span>
      </div>
    );
  }

  function proxima() {
    setIndiceAtual((prev) => (prev + 1) % midias.length);
  }

  function anterior() {
    setIndiceAtual((prev) => (prev - 1 + midias.length) % midias.length);
  }

  const midiaAtual = midias[indiceAtual];

  return (
    <div style={styles.container}>
      <div style={styles.mediaContainer}>
        {midiaAtual.tipo === 'imagem' ? (
          <img 
            src={midiaAtual.url} 
            alt="Sobre nós" 
            style={styles.media}
          />
        ) : (
          <video 
            src={midiaAtual.url} 
            style={styles.media}
            autoPlay 
            muted 
            loop 
          />
        )}

        {midias.length > 1 && (
          <>
            <button onClick={anterior} style={styles.botaoEsquerda}>←</button>
            <button onClick={proxima} style={styles.botaoDireita}>→</button>
          </>
        )}
      </div>

      {midias.length > 1 && (
        <div style={styles.indicadores}>
          {midias.map((_, index) => (
            <span
              key={index}
              onClick={() => setIndiceAtual(index)}
              style={{
                ...styles.indicador,
                backgroundColor: index === indiceAtual ? '#ff6b00' : '#ddd'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative' as const
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    position: 'relative' as const
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  botaoEsquerda: {
    position: 'absolute' as const,
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: 10
  },
  botaoDireita: {
    position: 'absolute' as const,
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: 10
  },
  indicadores: {
    position: 'absolute' as const,
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    zIndex: 10
  },
  indicador: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    color: '#999'
  },
  placeholderTexto: {
    fontSize: '18px'
  }
};