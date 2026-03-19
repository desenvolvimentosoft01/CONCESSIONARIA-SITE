'use client';

import { useState, useEffect } from 'react';

interface Midia {
  id: number;
  titulo: string;
  tipo: 'imagem' | 'video';
  url: string;
  secao: string;
  ordem: number;
  ativo: boolean;
}

interface GerenciarMidiaProps {
  secao: string; // 'carrossel', 'sobre', 'destaque'
  onSelect?: (url: string) => void;
}

export default function GerenciarMidia({ secao, onSelect }: GerenciarMidiaProps) {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tipoUpload, setTipoUpload] = useState<'imagem' | 'video'>('imagem');
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    carregarMidias();
  }, [secao]);

  async function carregarMidias() {
    const res = await fetch('/api/midia');
    const data = await res.json();
    setMidias(data.filter((m: Midia) => m.secao === secao));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipoUpload);

    try {
      const res = await fetch('/api/midia/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        await fetch('/api/midia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: titulo || file.name,
            tipo: tipoUpload,
            url: data.url,
            secao
          })
        });
        
        setTitulo('');
        carregarMidias();
      }
    } catch (error) {
      alert('Erro no upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta mídia?')) return;
    
    await fetch('/api/midia', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    
    carregarMidias();
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.titulo}>📁 Gerenciar Mídia - {secao}</h3>
      
      <div style={styles.uploadArea}>
        <select 
          value={tipoUpload} 
          onChange={(e) => setTipoUpload(e.target.value as 'imagem' | 'video')}
          style={styles.select}
        >
          <option value="imagem">📷 Imagem</option>
          <option value="video">🎥 Vídeo</option>
        </select>
        
        <input
          type="text"
          placeholder="Título (opcional)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={styles.input}
        />
        
        <label style={uploading ? styles.uploadButtonDisabled : styles.uploadButton}>
          {uploading ? 'Enviando...' : 'Selecionar arquivo'}
          <input
            type="file"
            accept={tipoUpload === 'imagem' ? 'image/*' : 'video/*'}
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div style={styles.grid}>
        {midias.map((midia) => (
          <div key={midia.id} style={styles.card}>
            {midia.tipo === 'imagem' ? (
              <img src={midia.url} alt={midia.titulo} style={styles.preview} />
            ) : (
              <video src={midia.url} style={styles.preview} />
            )}
            <p style={styles.tituloMidia}>{midia.titulo}</p>
            <div style={styles.acoes}>
              {onSelect && (
                <button onClick={() => onSelect(midia.url)} style={styles.botaoUsar}>
                  Usar
                </button>
              )}
              <button onClick={() => handleDelete(midia.id)} style={styles.botaoRemover}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  titulo: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '15px',
    borderBottom: '2px solid #ff6b00',
    paddingBottom: '10px'
  },
  uploadArea: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    flex: 1
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    flex: 2
  },
  uploadButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center' as const
  },
  uploadButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    borderRadius: '5px',
    cursor: 'not-allowed'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px'
  },
  card: {
    border: '1px solid #eee',
    borderRadius: '5px',
    overflow: 'hidden',
    position: 'relative' as const
  },
  preview: {
    width: '100%',
    height: '120px',
    objectFit: 'cover' as const
  },
  tituloMidia: {
    fontSize: '12px',
    padding: '5px',
    margin: 0,
    backgroundColor: '#f5f5f5'
  },
  acoes: {
    display: 'flex',
    gap: '5px',
    padding: '5px'
  },
  botaoUsar: {
    flex: 1,
    padding: '5px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  botaoRemover: {
    padding: '5px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};