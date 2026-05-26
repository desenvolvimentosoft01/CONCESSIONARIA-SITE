'use client';

import { useState, useEffect } from 'react';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

interface Midia {
  id: number;
  titulo: string;
  tipo: string;
  url: string;
  secao: string;
}

const SECOES = [
  { id: 'carrossel',      label: 'Carrossel (Home)' },
  { id: 'sobre',          label: 'Sobre Nós (Home)' },
  { id: 'empresa',        label: 'Fotos Empresa' },
  { id: 'banner-empresa', label: 'Banner Empresa' },
  { id: 'banner-estoque', label: 'Banner Estoque' },
  { id: 'banner-servicos',label: 'Banner Serviços' },
  { id: 'banner-contato', label: 'Banner Contato' },
];

export default function MidiaPage() {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [secao, setSecao] = useState('carrossel');
  const [uploading, setUploading] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' | 'aviso' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [midiaParaRemover, setMidiaParaRemover] = useState<number | null>(null);

  useEffect(() => { carregarMidias(); }, [secao]);

  async function carregarMidias() {
    try {
      const res = await fetch('/api/midia');
      const data = await res.json();
      setMidias(data.filter((m: Midia) => m.secao === secao));
    } catch {
      console.error('Erro ao carregar mídias');
    }
  }

  async function handleUpload() {
    if (!arquivo) { setToast({ mensagem: 'Selecione um arquivo', tipo: 'aviso' }); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('tipo', arquivo.type.startsWith('image/') ? 'imagem' : 'video');
    try {
      const uploadRes = await fetch('/api/midia/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadRes.ok) {
        const tituloFinal = secao === 'carrossel'
          ? (titulo.trim() || 'Encontre o carro dos seus sonhos')
          : arquivo.name;
        await fetch('/api/midia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo: tituloFinal, tipo: arquivo.type.startsWith('image/') ? 'imagem' : 'video', url: uploadData.url, secao }),
        });
        setTitulo('');
        setArquivo(null);
        carregarMidias();
        setToast({ mensagem: 'Upload realizado com sucesso!', tipo: 'sucesso' });
      }
    } catch {
      setToast({ mensagem: 'Erro no upload', tipo: 'erro' });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    setConfirmDelete(false);
    setMidiaParaRemover(null);
    await fetch('/api/midia', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    carregarMidias();
  }

  return (
    <div>
      {/* Seção tabs */}
      <div style={s.tabs}>
        {SECOES.map(sec => (
          <button
            key={sec.id}
            onClick={() => setSecao(sec.id)}
            style={secao === sec.id ? s.tabAtiva : s.tab}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {/* Upload */}
        <div style={s.uploadArea}>
          <h3 style={s.subtitulo}>Upload — {SECOES.find(s => s.id === secao)?.label}</h3>
          {secao === 'carrossel' && (
            <div style={s.formGroup}>
              <label style={s.label}>Título (opcional)</label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                style={s.input}
                placeholder='Deixe em branco para usar "Encontre o carro dos seus sonhos"'
              />
            </div>
          )}
          <div style={s.formGroup}>
            <label style={s.label}>Arquivo</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={e => setArquivo(e.target.files?.[0] || null)}
              style={s.input}
            />
            {arquivo && <p style={s.fileInfo}>{arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)</p>}
          </div>
          <button onClick={handleUpload} disabled={uploading} style={uploading ? s.btnUploadDisabled : s.btnUpload}>
            {uploading ? 'Enviando...' : 'Upload'}
          </button>
        </div>

        {/* Lista */}
        <div>
          <h3 style={s.subtitulo}>Arquivos nesta seção</h3>
          {midias.length === 0 ? (
            <p style={s.vazio}>Nenhuma mídia cadastrada nesta seção.</p>
          ) : (
            <div style={s.grid}>
              {midias.map(midia => (
                <div key={midia.id} style={s.card}>
                  {midia.tipo === 'imagem'
                    ? <img src={midia.url} alt={midia.titulo} style={s.preview} />
                    : <video src={midia.url} style={s.preview} />
                  }
                  <p style={s.cardTitulo}>{midia.titulo}</p>
                  <button onClick={() => { setMidiaParaRemover(midia.id); setConfirmDelete(true); }} style={s.btnRemover}>
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && midiaParaRemover !== null && (
        <ConfirmModal
          titulo="Remover mídia"
          mensagem="Tem certeza que deseja remover esta mídia?"
          confirmText="Remover"
          cancelText="Cancelar"
          onConfirm={() => handleDelete(midiaParaRemover)}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </div>
  );
}

const s = {
  tabs: { display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 20 },
  tab: { padding: '8px 14px', backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#666', fontWeight: 600 } as const,
  tabAtiva: { padding: '8px 14px', backgroundColor: '#1a1400', border: '1px solid #c5a059', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#c5a059', fontWeight: 700 } as const,
  content: { backgroundColor: '#0d0d0d', padding: 24, borderRadius: 6, border: '1px solid #1a1a1a' } as const,
  uploadArea: { borderBottom: '1px solid #1a1a1a', paddingBottom: 24, marginBottom: 24 } as const,
  subtitulo: { fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 16 },
  formGroup: { marginBottom: 14 } as const,
  label: { display: 'block', fontSize: 12, color: '#555', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 } as const,
  input: { width: '100%', padding: '9px 12px', border: '1px solid #1a1a1a', borderRadius: 4, backgroundColor: '#111', color: '#fff', fontSize: 13, boxSizing: 'border-box' as const },
  fileInfo: { fontSize: 12, color: '#555', marginTop: 6, fontStyle: 'italic' as const },
  btnUpload: { padding: '10px 22px', backgroundColor: '#c5a059', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 } as const,
  btnUploadDisabled: { padding: '10px 22px', backgroundColor: '#333', color: '#555', border: 'none', borderRadius: 4, cursor: 'not-allowed', fontSize: 13 } as const,
  vazio: { textAlign: 'center' as const, color: '#444', padding: 40, fontStyle: 'italic' as const },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 } as const,
  card: { border: '1px solid #1a1a1a', borderRadius: 6, overflow: 'hidden', backgroundColor: '#111' } as const,
  preview: { width: '100%', height: 110, objectFit: 'cover' as const, display: 'block' },
  cardTitulo: { fontSize: 11, padding: '8px 10px', margin: 0, color: '#666', backgroundColor: '#111', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  btnRemover: { width: '100%', padding: 8, backgroundColor: '#1a0000', color: '#dc3545', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, borderTop: '1px solid #1a1a1a' } as const,
};
