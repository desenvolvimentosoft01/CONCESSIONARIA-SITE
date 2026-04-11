'use client';

import { useState, useEffect } from 'react';

interface CarrosselProps {
  midias: any[];
}

export default function Carrossel({ midias }: CarrosselProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    if (midias.length <= 1) return;

    const timer = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % midias.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [midias.length]);

  function proximaImagem() {
    setIndiceAtual((prev) => (prev + 1) % midias.length);
  }

  function imagemAnterior() {
    setIndiceAtual((prev) => (prev - 1 + midias.length) % midias.length);
  }

  if (midias.length === 0) {
    return (
      <section style={styles.carrossel}>
        <div style={styles.carrosselContainer}>
          <div style={styles.carrosselItem}>
            <div style={styles.carrosselOverlay}>
              <h2 style={styles.carrosselTitulo}>Encontre o carro dos seus sonhos</h2>
              <p style={styles.carrosselTexto}>As melhores condições você encontra aqui</p>
              <a href="/estoque" style={styles.carrosselBotao}>Conheça nosso estoque</a>
            </div>
          </div>
        </div>
        <div style={styles.carrosselIndicadores}>
          <span style={styles.indicadorAtivo}></span>
        </div>
      </section>
    );
  }

  const midiaAtual = midias[indiceAtual];

  return (
    <section style={styles.carrossel}>
      <div style={styles.carrosselContainer}>
        <div style={styles.carrosselItem}>
          {midiaAtual.tipo === 'imagem' ? (
            <img 
              src={midiaAtual.url} 
              alt={midiaAtual.titulo || 'Carrossel'} 
              style={styles.carrosselImagem} 
            />
          ) : (
            <video 
              src={midiaAtual.url} 
              style={styles.carrosselImagem}
              autoPlay 
              muted 
              loop 
            />
          )}
          <div style={styles.carrosselOverlay}>
            <h2 style={styles.carrosselTitulo}>{midiaAtual.titulo || 'Encontre o carro dos seus sonhos'}</h2>
            <p style={styles.carrosselTexto}>As melhores condições você encontra aqui</p>
            <a href="/estoque" style={styles.carrosselBotao}>Conheça nosso estoque</a>
          </div>
        </div>
      </div>

      {midias.length > 1 && (
        <>
          <button onClick={imagemAnterior} style={styles.botaoEsquerda}>←</button>
          <button onClick={proximaImagem} style={styles.botaoDireita}>→</button>
        </>
      )}

      <div style={styles.carrosselIndicadores}>
        {midias.map((_, index) => (
          <span
            key={index}
            onClick={() => setIndiceAtual(index)}
            style={{
              ...styles.indicador,
              backgroundColor: index === indiceAtual ? '#c5a059' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </section>
  );
}

const styles = {
  carrossel: {
    position: 'relative' as const,
    height: '400px',
    overflow: 'hidden'
  },
  carrosselContainer: {
    height: '100%',
    width: '100%'
  },
  carrosselItem: {
    height: '100%',
    width: '100%',
    position: 'relative' as const
  },
  carrosselImagem: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  carrosselOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center' as const,
    padding: '20px'
  },
  carrosselTitulo: {
    fontSize: '36px',
    marginBottom: '10px',
    maxWidth: '800px'
  },
  carrosselTexto: {
    fontSize: '18px',
    marginBottom: '20px',
    maxWidth: '600px'
  },
  carrosselBotao: {
    padding: '12px 30px',
    backgroundColor: '#c5a059',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold'
  },
  botaoEsquerda: {
    position: 'absolute' as const,
    left: '20px',
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
    right: '20px',
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
  carrosselIndicadores: {
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
    transition: 'background-color 0.3s'
  },
  indicadorAtivo: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#c5a059'
  }
};
