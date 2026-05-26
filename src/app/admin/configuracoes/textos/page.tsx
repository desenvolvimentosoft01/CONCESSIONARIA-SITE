'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';

interface Diferencial { titulo: string; descricao: string; icone: string; }
interface Passo { numero: number; titulo: string; descricao: string; }
interface ConfigData { chave: string; valor: string; }

export default function TextosPage() {
  const [carregando, setCarregando] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [destaque, setDestaque] = useState('');
  const [diferenciais, setDiferenciais] = useState<Diferencial[]>([]);
  const [vantagens, setVantagens] = useState<string[]>([]);
  const [passos, setPassos] = useState<Passo[]>([]);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [modalDiferencial, setModalDiferencial] = useState<{ aberto: boolean; idx?: number; dados?: Diferencial }>({ aberto: false });
  const [modalPasso, setModalPasso] = useState<{ aberto: boolean; idx?: number; dados?: Passo }>({ aberto: false });
  const [novaVantagem, setNovaVantagem] = useState('');

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    try {
      const res = await fetch('/api/configuracao', { cache: 'no-store' });
      const dados: ConfigData[] = await res.json();
      const parse = (chave: string, def: any = null) => {
        const c = dados.find(d => d.chave === chave);
        if (!c) return def;
        try { return JSON.parse(c.valor); } catch { return c.valor; }
      };
      setTitulo(parse('financiamento_titulo', 'Realize Seu Sonho Automotivo'));
      setSubtitulo(parse('financiamento_subtitulo', 'Taxas competitivas e aprovação rápida'));
      setDestaque(parse('financiamento_destaque', 'Aprovação em até 24 horas'));
      setDiferenciais(parse('financiamento_diferenciais', [
        { titulo: 'Aprovação Rápida', descricao: 'Resposta em até 24 horas', icone: '⚡' },
        { titulo: 'Taxas Competitivas', descricao: 'As melhores do mercado', icone: '📊' },
        { titulo: 'Processo Simplificado', descricao: 'Poucos documentos necessários', icone: '📋' },
        { titulo: 'Financiamento Integral', descricao: 'Financie até o valor total', icone: '💰' },
      ]));
      setVantagens(parse('financiamento_vantagens', [
        'Carência de até 1 ano para primeira parcela',
        'Parcelamento em até 60 meses',
        'Parceiros com os maiores bancos do país',
        'Entrada a partir de 10%',
      ]));
      setPassos(parse('financiamento_passos', [
        { numero: 1, titulo: 'Preencha o Formulário', descricao: 'Informe seus dados' },
        { numero: 2, titulo: 'Análise de Crédito', descricao: 'Nossa equipe analisa sua solicitação' },
        { numero: 3, titulo: 'Receba a Proposta', descricao: 'Você recebe uma proposta personalizada' },
        { numero: 4, titulo: 'Concretize a Compra', descricao: 'Finalize o financiamento' },
      ]));
    } catch {
      setToast({ mensagem: 'Erro ao carregar dados', tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  }

  async function salvar(chave: string, valor: any, id: string) {
    setSalvandoId(id);
    try {
      const res = await fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, valor: typeof valor === 'string' ? valor : JSON.stringify(valor), descricao: `Financiamento - ${chave}`, categoria: 'financiamento', tipo: 'json' }),
      });
      setToast(res.ok ? { mensagem: 'Salvo!', tipo: 'sucesso' } : { mensagem: 'Erro ao salvar', tipo: 'erro' });
    } catch {
      setToast({ mensagem: 'Erro ao salvar', tipo: 'erro' });
    } finally {
      setSalvandoId(null);
    }
  }

  if (carregando) return <div style={s.loading}>Carregando...</div>;

  return (
    <div>
      {toast && <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />}

      <div style={s.headerRow}>
        <p style={s.desc}>Gerencie o conteúdo exibido na página de financiamento pública.</p>
        <Link href="/financiamento" target="_blank" style={s.btnVerPagina}>Ver Página →</Link>
      </div>

      {/* Textos principais */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Textos Principais</h2>
        <label style={s.label}>Título do Hero</label>
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} style={s.input} />
        <button onClick={() => salvar('financiamento_titulo', titulo, 'titulo')} disabled={salvandoId === 'titulo'} style={s.btn}>
          {salvandoId === 'titulo' ? 'Salvando...' : 'Salvar Título'}
        </button>

        <label style={{ ...s.label, marginTop: 20 }}>Subtítulo</label>
        <input type="text" value={subtitulo} onChange={e => setSubtitulo(e.target.value)} style={s.input} />
        <button onClick={() => salvar('financiamento_subtitulo', subtitulo, 'subtitulo')} disabled={salvandoId === 'subtitulo'} style={s.btn}>
          {salvandoId === 'subtitulo' ? 'Salvando...' : 'Salvar Subtítulo'}
        </button>

        <label style={{ ...s.label, marginTop: 20 }}>Destaque (badge dourado)</label>
        <input type="text" value={destaque} onChange={e => setDestaque(e.target.value)} style={s.input} />
        <button onClick={() => salvar('financiamento_destaque', destaque, 'destaque')} disabled={salvandoId === 'destaque'} style={s.btn}>
          {salvandoId === 'destaque' ? 'Salvando...' : 'Salvar Destaque'}
        </button>
      </div>

      {/* Diferenciais */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Diferenciais</h2>
        <div style={s.grid}>
          {diferenciais.map((item, idx) => (
            <div key={idx} style={s.card}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icone}</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#ddd' }}>{item.titulo}</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{item.descricao}</p>
              <button onClick={() => setModalDiferencial({ aberto: true, idx, dados: item })} style={{ ...s.btnSecundario, marginTop: 12, width: '100%' }}>
                Editar
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setModalDiferencial({ aberto: true })} style={{ ...s.btn, marginTop: 16 }}>+ Adicionar</button>
        {modalDiferencial.aberto && (
          <ModalDiferencial
            item={modalDiferencial.dados} idx={modalDiferencial.idx}
            onClose={() => setModalDiferencial({ aberto: false })}
            onSave={(item, idx) => {
              const novo = [...diferenciais];
              idx !== undefined ? (novo[idx] = item) : novo.push(item);
              setDiferenciais(novo);
              salvar('financiamento_diferenciais', novo, 'diferenciais');
              setModalDiferencial({ aberto: false });
            }}
          />
        )}
      </div>

      {/* Vantagens */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Vantagens</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input type="text" value={novaVantagem} onChange={e => setNovaVantagem(e.target.value)} placeholder="Nova vantagem..." style={{ ...s.input, flex: 1, margin: 0 }} />
          <button onClick={() => { if (novaVantagem.trim()) { const n = [...vantagens, novaVantagem]; setVantagens(n); setNovaVantagem(''); salvar('financiamento_vantagens', n, 'vantagens'); } }} style={s.btn}>
            + Adicionar
          </button>
        </div>
        {vantagens.map((v, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
            <span style={{ color: '#ccc', fontSize: 14 }}>{v}</span>
            <button onClick={() => { const n = vantagens.filter((_, i) => i !== idx); setVantagens(n); salvar('financiamento_vantagens', n, 'vantagens'); }} style={s.btnPerigo}>
              Remover
            </button>
          </div>
        ))}
      </div>

      {/* Passos */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Como Funciona (Passos)</h2>
        <div style={s.grid}>
          {passos.map((passo, idx) => (
            <div key={idx} style={s.card}>
              <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8, color: '#c5a059', fontWeight: 900 }}>{passo.numero}</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#ddd' }}>{passo.titulo}</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{passo.descricao}</p>
              <button onClick={() => setModalPasso({ aberto: true, idx, dados: passo })} style={{ ...s.btnSecundario, marginTop: 12, width: '100%' }}>
                Editar
              </button>
            </div>
          ))}
        </div>
        {modalPasso.aberto && (
          <ModalPasso
            item={modalPasso.dados} idx={modalPasso.idx}
            onClose={() => setModalPasso({ aberto: false })}
            onSave={(item, idx) => {
              const novo = [...passos];
              idx !== undefined ? (novo[idx] = item) : novo.push(item);
              setPassos(novo);
              salvar('financiamento_passos', novo, 'passos');
              setModalPasso({ aberto: false });
            }}
          />
        )}
      </div>
    </div>
  );
}

function ModalDiferencial({ item, idx, onClose, onSave }: { item?: Diferencial; idx?: number; onClose: () => void; onSave: (item: Diferencial, idx?: number) => void; }) {
  const [titulo, setTitulo] = useState(item?.titulo || '');
  const [descricao, setDescricao] = useState(item?.descricao || '');
  const [icone, setIcone] = useState(item?.icone || '⭐');
  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.box} onClick={e => e.stopPropagation()}>
        <h3 style={m.titulo}>{idx !== undefined ? 'Editar Diferencial' : 'Novo Diferencial'}</h3>
        <label style={s.label}>Título</label>
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} style={s.input} />
        <label style={{ ...s.label, marginTop: 12 }}>Descrição</label>
        <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} style={s.input} />
        <label style={{ ...s.label, marginTop: 12 }}>Ícone (emoji)</label>
        <input type="text" value={icone} onChange={e => setIcone(e.target.value)} style={s.input} maxLength={2} />
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => onSave({ titulo, descricao, icone }, idx)} style={{ ...s.btn, flex: 1 }}>Salvar</button>
          <button onClick={onClose} style={{ ...s.btnSecundario, flex: 1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ModalPasso({ item, idx, onClose, onSave }: { item?: Passo; idx?: number; onClose: () => void; onSave: (item: Passo, idx?: number) => void; }) {
  const [titulo, setTitulo] = useState(item?.titulo || '');
  const [descricao, setDescricao] = useState(item?.descricao || '');
  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.box} onClick={e => e.stopPropagation()}>
        <h3 style={m.titulo}>{idx !== undefined ? 'Editar Passo' : 'Novo Passo'}</h3>
        <label style={s.label}>Título</label>
        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} style={s.input} />
        <label style={{ ...s.label, marginTop: 12 }}>Descrição</label>
        <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} style={s.input} />
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => onSave({ numero: (item?.numero || (idx ?? 0)) + 1, titulo, descricao }, idx)} style={{ ...s.btn, flex: 1 }}>Salvar</button>
          <button onClick={onClose} style={{ ...s.btnSecundario, flex: 1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  loading: { padding: 60, textAlign: 'center' as const, color: '#555' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 } as const,
  desc: { color: '#555', fontSize: 13, margin: 0 } as const,
  btnVerPagina: { padding: '8px 16px', backgroundColor: '#111', border: '1px solid #1a1a1a', color: '#888', textDecoration: 'none', borderRadius: 4, fontSize: 12, fontWeight: 700 } as const,
  section: { marginBottom: 28, backgroundColor: '#0d0d0d', padding: 24, borderRadius: 6, border: '1px solid #1a1a1a' } as const,
  sectionTitle: { margin: '0 0 20px', fontSize: 11, fontWeight: 700, color: '#c5a059', textTransform: 'uppercase' as const, letterSpacing: 2 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 6 } as const,
  input: { width: '100%', padding: '9px 12px', backgroundColor: '#111', border: '1px solid #1a1a1a', color: '#fff', borderRadius: 4, fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' as const, marginBottom: 8 },
  btn: { padding: '9px 20px', fontSize: 12, fontWeight: 700, backgroundColor: '#c5a059', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: 1 } as const,
  btnSecundario: { padding: '9px 20px', fontSize: 12, fontWeight: 700, backgroundColor: '#111', color: '#888', border: '1px solid #1a1a1a', borderRadius: 4, cursor: 'pointer' } as const,
  btnPerigo: { padding: '6px 14px', fontSize: 12, fontWeight: 700, backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: 4, cursor: 'pointer' } as const,
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 8 } as const,
  card: { backgroundColor: '#111', padding: 18, borderRadius: 6, border: '1px solid #1a1a1a' } as const,
};

const m = {
  overlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  box: { backgroundColor: '#111', padding: 28, borderRadius: 8, border: '1px solid #1a1a1a', maxWidth: 480, width: '90%', color: '#fff' } as const,
  titulo: { margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#fff' } as const,
};
