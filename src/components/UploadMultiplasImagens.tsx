'use client';

import { useState, useEffect } from 'react';

interface UploadMultiplasImagensProps {
  carroId: number;
}

interface Midia {
  imagem_url: string;
  tipo: 'imagem' | 'video';
}

export default function UploadMultiplasImagens({ carroId }: UploadMultiplasImagensProps) {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);

  function mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 4000);
  }

  useEffect(() => {
    fetch(`/api/carros/${carroId}/imagens`)
      .then(res => res.json())
      .then(data => {
        const midiasFormatadas = data.map((item: any) => ({
          imagem_url: item.imagem_url,
          tipo: item.tipo || 'imagem'
        }));
        setMidias(midiasFormatadas);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, [carroId]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tipo = file.type.startsWith('video/') ? 'video' : 'imagem';
      
      console.log('📤 Enviando arquivo:', file.name, 'Tipo:', tipo);
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadRes.json();
        console.log('📦 Resposta upload:', uploadData);

        if (uploadRes.ok) {
          const saveRes = await fetch(`/api/carros/${carroId}/imagens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              imagem_url: uploadData.imagem_url,
              tipo: tipo
            })
          });

          const saveData = await saveRes.json();
          console.log('💾 Resposta salvar:', saveData);

          if (saveRes.ok) {
            setMidias(prev => [...prev, { imagem_url: uploadData.imagem_url, tipo }]);
            console.log('✅ Mídia adicionada com sucesso');
            mostrarMensagem('Arquivo enviado com sucesso!', 'sucesso');
          } else {
            console.error('❌ Erro ao salvar no banco:', saveData);
            mostrarMensagem('Erro ao salvar: ' + (saveData.erro || 'Erro desconhecido'), 'erro');
          }
        } else {
          console.error('❌ Erro no upload:', uploadData);
          mostrarMensagem('Erro no upload: ' + (uploadData.erro || 'Erro desconhecido'), 'erro');
        }
      } catch (error) {
        console.error('❌ Erro geral:', error);
        mostrarMensagem('Erro ao enviar arquivo', 'erro');
      }
    }

    setUploading(false);
  }

  async function handleDelete(midiaUrl: string) {
    if (!confirm('Remover esta midia?')) return;

    try {
      await fetch(`/api/carros/${carroId}/imagens`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagem_url: midiaUrl })
      });

      setMidias(prev => prev.filter(m => m.imagem_url !== midiaUrl));
    } catch (error) {
      alert('Erro ao remover midia');
    }
  }

  if (carregando) {
    return <div style={styles.carregando}>Carregando midias...</div>;
  }

  return (
    <div style={styles.container}>
      {mensagem && (
        <div style={mensagem.tipo === 'sucesso' ? styles.toastSucesso : styles.toastErro}>
          {mensagem.texto}
        </div>
      )}
      
      <h3 style={styles.titulo}>Fotos e Videos do Carro</h3>
      
      <div style={styles.uploadArea}>
        <label style={styles.uploadButton}>
          {uploading ? 'Enviando...' : 'Selecionar fotos e videos'}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        <p style={styles.uploadInfo}>
          Voce pode selecionar varias fotos e videos de uma vez. Formatos: JPG, PNG, WEBP, MP4, MOV (max 50MB cada)
        </p>
      </div>

      {midias.length > 0 && (
        <>
          <p style={styles.totalFotos}>{midias.length} midia(s) cadastrada(s)</p>
          <div style={styles.galeria}>
            {midias.map((midia, index) => (
              <div key={index} style={styles.thumbContainer}>
                {midia.tipo === 'video' ? (
                  <>
                    <video 
                      src={midia.imagem_url}
                      style={styles.thumb}
                      muted
                    />
                    <div style={styles.videoIcon}>▶</div>
                  </>
                ) : (
                  <img 
                    src={midia.imagem_url} 
                    alt={`Foto ${index + 1}`}
                    style={styles.thumb}
                  />
                )}
                <button 
                  onClick={() => handleDelete(midia.imagem_url)}
                  style={styles.botaoRemover}
                  title="Remover midia"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {midias.length === 0 && !uploading && (
        <p style={styles.semImagens}>Nenhuma foto ou video cadastrado ainda.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    border: '1px solid #eee'
  },
  titulo: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '15px'
  },
  carregando: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#666'
  },
  uploadArea: {
    border: '2px dashed #ddd',
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: '20px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  uploadButton: {
    background: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '14px'
  },
  uploadInfo: {
    fontSize: '12px',
    color: '#999',
    marginTop: '10px'
  },
  totalFotos: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px'
  },
  galeria: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '15px'
  },
  thumbContainer: {
    position: 'relative' as const,
    paddingTop: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  thumb: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  videoIcon: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '30px',
    color: 'white',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    pointerEvents: 'none' as const
  },
  botaoRemover: {
    position: 'absolute' as const,
    top: '5px',
    right: '5px',
    background: 'rgba(220, 53, 69, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '25px',
    height: '25px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  semImagens: {
    textAlign: 'center' as const,
    color: '#999',
    fontStyle: 'italic'
  },
  toastSucesso: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#28a745',
    color: 'white',
    padding: '20px 40px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease-in-out'
  },
  toastErro: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '20px 40px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease-in-out'
  }
};
