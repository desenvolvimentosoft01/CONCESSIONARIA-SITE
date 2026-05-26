'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';

interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  descricao?: string;
  tipo: string;
  categoria: string;
}

export default function CoresPage() {
  const [configs, setConfigs] = useState<Configuracao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' | 'aviso' } | null>(null);
  const [resetando, setResetando] = useState(false);

  useEffect(() => { carregarConfiguracoes(); }, []);

  async function carregarConfiguracoes() {
    try {
      const res = await fetch('/api/configuracao', { cache: 'no-store' });
      setConfigs(await res.json());
    } catch {
      setToast({ mensagem: 'Erro ao carregar configurações', tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  }

  async function handleSalvar(config: Configuracao) {
    setSalvandoId(config.id);
    try {
      const res = await fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave: config.chave, valor: config.valor }),
      });
      setToast(res.ok
        ? { mensagem: 'Cor salva com sucesso!', tipo: 'sucesso' }
        : { mensagem: 'Erro ao salvar', tipo: 'erro' }
      );
    } catch {
      setToast({ mensagem: 'Erro de conexão', tipo: 'erro' });
    } finally {
      setSalvandoId(null);
    }
  }

  function handleChange(chave: string, valor: string) {
    setConfigs(prev => prev.map(c => c.chave === chave ? { ...c, valor } : c));
  }

  async function confirmarResetar() {
    setConfirmOpen(false);
    setResetando(true);
    const padrao = [
      { chave: 'cor_primaria',        valor: '#c5a059', descricao: 'Cor Primária' },
      { chave: 'cor_secundaria',      valor: '#333333', descricao: 'Cor Secundária' },
      { chave: 'cor_fundo',           valor: '#0f0f0f', descricao: 'Cor de Fundo' },
      { chave: 'cor_header',          valor: '#000000', descricao: 'Cor do Cabeçalho' },
      { chave: 'cor_header_texto',    valor: '#ffffff', descricao: 'Texto do Cabeçalho' },
      { chave: 'cor_footer',          valor: '#000000', descricao: 'Cor do Rodapé' },
      { chave: 'cor_footer_texto',    valor: '#ffffff', descricao: 'Texto do Rodapé' },
      { chave: 'cor_botao_primario',  valor: '#c5a059', descricao: 'Botão Primário' },
      { chave: 'cor_botao_texto',     valor: '#ffffff', descricao: 'Texto do Botão' },
      { chave: 'cor_botao_secundario',valor: '#333333', descricao: 'Botão Secundário' },
      { chave: 'cor_whatsapp',        valor: '#25d366', descricao: 'Botão WhatsApp' },
      { chave: 'cor_link',            valor: '#c5a059', descricao: 'Cor de Links' },
      { chave: 'cor_destaque',        valor: '#c5a059', descricao: 'Cor de Destaque' },
      { chave: 'cor_sucesso',         valor: '#28a745', descricao: 'Cor de Sucesso' },
      { chave: 'cor_erro',            valor: '#dc3545', descricao: 'Cor de Erro' },
    ];
    try {
      await Promise.all(padrao.map(item =>
        fetch('/api/configuracao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, categoria: 'cores', tipo: 'color' }),
        })
      ));
      setToast({ mensagem: 'Cores resetadas com sucesso!', tipo: 'sucesso' });
      await carregarConfiguracoes();
    } catch {
      setToast({ mensagem: 'Erro ao resetar', tipo: 'erro' });
    } finally {
      setResetando(false);
    }
  }

  function getCorPadrao(chave: string): string {
    const padroes: Record<string, string> = {
      cor_primaria: '#c5a059', cor_secundaria: '#333333', cor_fundo: '#0f0f0f',
      cor_header: '#000000', cor_header_texto: '#ffffff', cor_footer: '#000000',
      cor_footer_texto: '#ffffff', cor_botao_primario: '#c5a059', cor_botao_texto: '#ffffff',
      cor_botao_secundario: '#333333', cor_whatsapp: '#25d366', cor_link: '#c5a059',
      cor_destaque: '#c5a059', cor_sucesso: '#28a745', cor_erro: '#dc3545',
    };
    return padroes[chave] || '#cccccc';
  }

  const porCategoria = configs.reduce((acc, c) => {
    const cat = c.categoria || 'geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {} as Record<string, Configuracao[]>);

  if (carregando) return <div style={s.loading}>Carregando...</div>;

  return (
    <div style={s.container}>
      <div style={s.toolbar}>
        <div style={s.aviso}>
          <strong>Atenção:</strong> As alterações são aplicadas em todo o site imediatamente após salvar.
        </div>
        <button onClick={() => setConfirmOpen(true)} style={s.btnResetar}>
          Resetar Padrão
        </button>
      </div>

      {confirmOpen && (
        <ConfirmModal
          titulo="Resetar cores padrão"
          mensagem="Deseja realmente resetar todas as cores para o padrão?"
          confirmText="Sim, resetar"
          cancelText="Cancelar"
          onConfirm={confirmarResetar}
          onCancel={() => setConfirmOpen(false)}
          loading={resetando}
        />
      )}

      <div style={s.content}>
        {configs.length === 0 && (
          <div style={s.vazio}>
            <p>Nenhuma configuração encontrada.</p>
            <p>Clique em <strong>Resetar Padrão</strong> para criar as cores iniciais.</p>
          </div>
        )}

        {Object.entries(porCategoria).map(([categoria, items]) => (
          <div key={categoria} style={s.categoria}>
            <h2 style={s.categoriaTitulo}>
              {categoria === 'cores' ? 'Cores do Site' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
            </h2>
            <div style={s.grid}>
              {items.map(config => (
                <div key={config.id} style={s.card}>
                  <label style={s.label}>{config.descricao || config.chave}</label>
                  <div style={s.inputGroup}>
                    <input
                      type="color"
                      value={config.valor}
                      onChange={e => handleChange(config.chave, e.target.value)}
                      style={s.colorInput}
                    />
                    <input
                      type="text"
                      value={config.valor}
                      onChange={e => handleChange(config.chave, e.target.value)}
                      style={s.textInput}
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </div>
                  <div style={s.previewRow}>
                    <div style={s.previewBox}>
                      <div style={{ ...s.preview, backgroundColor: config.valor, border: config.valor === '#ffffff' ? '1px solid #333' : 'none' }} />
                      <span style={s.previewLabel}>Atual</span>
                    </div>
                    <div style={s.previewBox}>
                      <div style={{ ...s.preview, backgroundColor: getCorPadrao(config.chave), opacity: 0.5 }} />
                      <span style={s.previewLabel}>Padrão</span>
                    </div>
                    <button
                      onClick={() => handleSalvar(config)}
                      disabled={salvandoId === config.id}
                      style={salvandoId === config.id ? s.btnSalvarDisabled : s.btnSalvar}
                    >
                      {salvandoId === config.id ? '...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </div>
  );
}

const s = {
  container: { maxWidth: 1400 } as const,
  loading: { padding: 60, textAlign: 'center' as const, color: '#555' },
  toolbar: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 } as const,
  aviso: { flex: 1, padding: '10px 16px', backgroundColor: '#1a1500', border: '1px solid #3a2e00', borderRadius: 4, fontSize: 13, color: '#c5a059' } as const,
  btnResetar: { padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' as const },
  content: { backgroundColor: '#0d0d0d', padding: 28, borderRadius: 6, border: '1px solid #1a1a1a' } as const,
  vazio: { textAlign: 'center' as const, padding: 40, color: '#555', fontSize: 14 },
  categoria: { marginBottom: 32 } as const,
  categoriaTitulo: { fontSize: 11, fontWeight: 700, color: '#c5a059', textTransform: 'uppercase' as const, letterSpacing: 2, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #1a1a1a' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 } as const,
  card: { padding: 16, border: '1px solid #1a1a1a', borderRadius: 6, backgroundColor: '#111', display: 'flex', flexDirection: 'column' as const, gap: 10 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#ddd' } as const,
  inputGroup: { display: 'flex', gap: 10 } as const,
  colorInput: { width: 48, height: 36, border: '1px solid #333', borderRadius: 4, cursor: 'pointer', padding: 2, backgroundColor: '#000' } as const,
  textInput: { flex: 1, padding: '8px 10px', border: '1px solid #1a1a1a', borderRadius: 4, backgroundColor: '#000', fontSize: 13, fontFamily: 'monospace', color: '#fff', textTransform: 'uppercase' as const },
  previewRow: { display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#0a0a0a', padding: 10, borderRadius: 4 } as const,
  previewBox: { width: 56, textAlign: 'center' as const },
  preview: { height: 28, borderRadius: 4, marginBottom: 2 } as const,
  previewLabel: { display: 'block', fontSize: 10, color: '#444', textTransform: 'uppercase' as const },
  btnSalvar: { marginLeft: 'auto', padding: '7px 14px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 } as const,
  btnSalvarDisabled: { marginLeft: 'auto', padding: '7px 14px', backgroundColor: '#333', color: '#666', border: 'none', borderRadius: 4, cursor: 'wait', fontSize: 12 } as const,
};
