'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

interface Midia {
  id: number;
  titulo: string;
  tipo: string;
  url: string;
  secao: string;
}

export default function AdminMidiaPage() {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [secao, setSecao] = useState('carrossel');
  const [uploading, setUploading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [toast, setToast] = useState<{mensagem: string, tipo: 'sucesso' | 'erro' | 'aviso'} | null>(null);
  const [mostrarConfirmDelete, setMostrarConfirmDelete] = useState(false);
  const [midiaParaRemover, setMidiaParaRemover] = useState<number | null>(null);

  useEffect(() => {
    carregarMidias();
  }, [secao]);

  async function carregarMidias() {
    try {
      const res = await fetch('/api/midia');
      const data = await res.json();
      setMidias(data.filter((m: Midia) => m.secao === secao));
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
  }

  async function handleUpload() {
    if (!arquivo) {
      setToast({ mensagem: 'Selecione um arquivo', tipo: 'aviso' });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('tipo', arquivo.type.startsWith('image/') ? 'imagem' : 'video');

    try {
      const uploadRes = await fetch('/api/midia/upload', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (uploadRes.ok) {
        // Define o título baseado na seção
        let tituloFinal;
        if (secao === 'carrossel') {
          // Se o usuário preencheu, usa o que ele digitou
          // Se não, usa o título padrão
          tituloFinal = titulo.trim() || 'Encontre o carro dos seus sonhos';
        } else {
          // Para outras seções, usa o nome do arquivo
          tituloFinal = arquivo.name;
        }
        
        await fetch('/api/midia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: tituloFinal,
            tipo: arquivo.type.startsWith('image/') ? 'imagem' : 'video',
            url: uploadData.url,
            secao
          })
        });

        setTitulo('');
        setArquivo(null);
        carregarMidias();
        setToast({ mensagem: 'Upload realizado com sucesso!', tipo: 'sucesso' });
      }
    } catch (error) {
      setToast({ mensagem: 'Erro no upload', tipo: 'erro' });
    } finally {
      setUploading(false);
    }
  }

  function solicitarDelete(id: number) {
    setMidiaParaRemover(id);
    setMostrarConfirmDelete(true);
  }

  async function handleDelete(id: number) {
    setMostrarConfirmDelete(false);
    setMidiaParaRemover(null);

    await fetch('/api/midia', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    carregarMidias();
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link href="/admin/dashboard" style={styles.botaoVoltar}>← Voltar</Link>
          <h1 style={styles.titulo}>📁 Gerenciar Mídia</h1>
        </div>
      </div>

    <div style={styles.tabs}>
      <button onClick={() => setSecao('carrossel')} style={secao === 'carrossel' ? styles.tabAtiva : styles.tab}>
        🎠 Carrossel (Home)
      </button>
      <button onClick={() => setSecao('sobre')} style={secao === 'sobre' ? styles.tabAtiva : styles.tab}>
        📄 Sobre Nós (Home)
      </button>
      <button onClick={() => setSecao('empresa')} style={secao === 'empresa' ? styles.tabAtiva : styles.tab}>
        🖼️ Fotos Sobre Nós (Empresa)
      </button>
      <button onClick={() => setSecao('banner-empresa')} style={secao === 'banner-empresa' ? styles.tabAtiva : styles.tab}>
        🏢 Banner Empresa
      </button>
      <button onClick={() => setSecao('banner-estoque')} style={secao === 'banner-estoque' ? styles.tabAtiva : styles.tab}>
        🚗 Banner Estoque
      </button>
      <button onClick={() => setSecao('banner-servicos')} style={secao === 'banner-servicos' ? styles.tabAtiva : styles.tab}>
        🔧 Banner Serviços
      </button>
      <button onClick={() => setSecao('banner-contato')} style={secao === 'banner-contato' ? styles.tabAtiva : styles.tab}>
        📞 Banner Contato
      </button>
    </div>

      <div style={styles.content}>
        {/* Área de Upload - Campo título aparece APENAS no carrossel */}
        <div style={styles.uploadArea}>
          <h3 style={styles.subtitulo}>📤 Upload de Mídia para {secao}</h3>
          
          {/* Campo Título - Só aparece na seção carrossel */}
          {secao === 'carrossel' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Título (opcional):</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                style={styles.input}
                placeholder="Digite um título (deixe em branco para usar o padrão)"
              />
              <p style={styles.helperText}>Se não preencher, será usado "Encontre o carro dos seus sonhos"</p>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Arquivo:</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
              style={styles.input}
            />
            {arquivo && (
              <p style={styles.fileInfo}>📄 {arquivo.name} ({(arquivo.size / 1024).toFixed(2)} KB)</p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={uploading ? styles.botaoUploadDisabled : styles.botaoUpload}
          >
            {uploading ? 'Enviando...' : '📤 Upload'}
          </button>
        </div>

        {/* Lista de Mídias */}
        <div style={styles.listaArea}>
          <h3 style={styles.subtitulo}>📋 Mídias em {secao}</h3>
          
          {midias.length === 0 ? (
            <p style={styles.vazio}>Nenhuma mídia cadastrada nesta seção.</p>
          ) : (
            <div style={styles.grid}>
              {midias.map((midia) => (
                <div key={midia.id} style={styles.card}>
                  {midia.tipo === 'imagem' ? (
                    <img src={midia.url} alt={midia.titulo} style={styles.preview} />
                  ) : (
                    <video src={midia.url} style={styles.preview} />
                  )}
                  <p style={styles.cardTitulo}>{midia.titulo}</p>
                  <button
                    onClick={() => solicitarDelete(midia.id)}
                    style={styles.botaoRemover}
                  >
                    ✕ Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {mostrarConfirmDelete && midiaParaRemover !== null && (
        <ConfirmModal
          titulo="Remover mídia"
          mensagem="Tem certeza que deseja remover esta mídia?"
          confirmText="Remover"
          cancelText="Cancelar"
          onConfirm={() => handleDelete(midiaParaRemover)}
          onCancel={() => setMostrarConfirmDelete(false)}
        />
      )}

      {toast && (
        <Toast 
          mensagem={toast.mensagem} 
          tipo={toast.tipo} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  titulo: {
    fontSize: '24px',
    color: '#333',
    margin: 0
  },
  botaoVoltar: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '14px'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    flex: 1
  },
  tabAtiva: {
    padding: '10px 20px',
    backgroundColor: '#ff6b00',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    flex: 1
  },
  content: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  uploadArea: {
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
    marginBottom: '20px'
  },
  listaArea: {},
  subtitulo: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '15px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  },
  helperText: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
    fontStyle: 'italic'
  },
  fileInfo: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
    fontStyle: 'italic'
  },
  botaoUpload: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  botaoUploadDisabled: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
    fontSize: '14px'
  },
  vazio: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '40px',
    fontStyle: 'italic'
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
    backgroundColor: '#f9f9f9'
  },
  preview: {
    width: '100%',
    height: '120px',
    objectFit: 'cover' as const
  },
  cardTitulo: {
    fontSize: '12px',
    padding: '10px',
    margin: 0,
    backgroundColor: 'white'
  },
  botaoRemover: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px'
  }
};