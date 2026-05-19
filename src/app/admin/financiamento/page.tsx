'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';

interface Diferencial {
  titulo: string;
  descricao: string;
  icone: string;
}

interface Passo {
  numero: number;
  titulo: string;
  descricao: string;
}

interface ConfigData {
  chave: string;
  valor: string;
}

export default function AdminFinanciamentoPage() {
  const [carregando, setCarregando] = useState(true);

  // State para campos simples
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [destaque, setDestaque] = useState('');

  // State para arrays
  const [diferenciais, setDiferenciais] = useState<Diferencial[]>([]);
  const [vantagens, setVantagens] = useState<string[]>([]);
  const [passos, setPassos] = useState<Passo[]>([]);

  // UI state
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'sucesso' | 'erro' } | null>(null);

  // Modal state
  const [modalDiferencial, setModalDiferencial] = useState<{ aberto: boolean; idx?: number; dados?: Diferencial }>({ aberto: false });
  const [modalPasso, setModalPasso] = useState<{ aberto: boolean; idx?: number; dados?: Passo }>({ aberto: false });
  const [novaVantagem, setNovaVantagem] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const res = await fetch('/api/configuracao', { cache: 'no-store' });
      const dados: ConfigData[] = await res.json();

      const parseConfig = (chave: string, defaultValue: any = null) => {
        const config = dados.find((d) => d.chave === chave);
        if (!config) return defaultValue;
        try {
          return JSON.parse(config.valor);
        } catch {
          return config.valor;
        }
      };

      setTitulo(parseConfig('financiamento_titulo', 'Realize Seu Sonho Automotivo'));
      setSubtitulo(parseConfig('financiamento_subtitulo', 'Taxas competitivas e aprovação rápida'));
      setDestaque(parseConfig('financiamento_destaque', 'Aprovação em até 24 horas'));
      setDiferenciais(
        parseConfig('financiamento_diferenciais', [
          { titulo: 'Aprovação Rápida', descricao: 'Resposta em até 24 horas', icone: '⚡' },
          { titulo: 'Taxas Competitivas', descricao: 'As melhores do mercado', icone: '📊' },
          { titulo: 'Processo Simplificado', descricao: 'Poucos documentos necessários', icone: '📋' },
          { titulo: 'Financiamento Integral', descricao: 'Financie até o valor total', icone: '💰' },
        ])
      );
      setVantagens(
        parseConfig('financiamento_vantagens', [
          'Carência de até 1 ano para primeira parcela',
          'Parcelamento em até 60 meses',
          'Parceiros com os maiores bancos do país',
          'Entrada a partir de 10%',
        ])
      );
      setPassos(
        parseConfig('financiamento_passos', [
          { numero: 1, titulo: 'Preencha o Formulário', descricao: 'Informe seus dados' },
          { numero: 2, titulo: 'Análise de Crédito', descricao: 'Nossa equipe analisa sua solicitação' },
          { numero: 3, titulo: 'Receba a Proposta', descricao: 'Você recebe uma proposta personalizada' },
          { numero: 4, titulo: 'Concretize a Compra', descricao: 'Finalize o financiamento' },
        ])
      );
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setToast({ mensagem: 'Erro ao carregar dados', tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  }

  async function salvarConfig(chave: string, valor: any, id: string) {
    setSalvandoId(id);
    try {
      const res = await fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chave,
          valor: typeof valor === 'string' ? valor : JSON.stringify(valor),
          descricao: `Financiamento - ${chave}`,
          categoria: 'financiamento',
          tipo: 'json',
        }),
      });

      if (res.ok) {
        setToast({ mensagem: 'Salvo com sucesso!', tipo: 'sucesso' });
      } else {
        setToast({ mensagem: 'Erro ao salvar', tipo: 'erro' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setToast({ mensagem: 'Erro ao salvar', tipo: 'erro' });
    } finally {
      setSalvandoId(null);
    }
  }

  if (carregando) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ffffff' }}>
        Carregando...
      </div>
    );
  }

  const styles = {
    container: {
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#ffffff',
    } as const,
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      borderBottom: '1px solid #333333',
      paddingBottom: '20px',
    } as const,
    section: {
      marginBottom: '50px',
      backgroundColor: '#1a1a1a',
      padding: '30px',
      borderRadius: '8px',
      border: '1px solid #333333',
    } as const,
    label: {
      display: 'block' as const,
      fontSize: '12px',
      fontWeight: 700,
      color: '#aaaaaa',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginBottom: '8px',
      marginTop: '20px',
    },
    input: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#262626',
      border: '1px solid #333333',
      color: '#ffffff',
      borderRadius: '4px',
      fontFamily: 'inherit',
      fontSize: '14px',
      boxSizing: 'border-box' as const,
    } as const,
    button: (variant: 'primary' | 'secondary' | 'danger' = 'primary') => ({
      padding: '10px 20px',
      fontSize: '12px',
      fontWeight: 700,
      backgroundColor:
        variant === 'primary' ? '#c5a059' : variant === 'danger' ? '#ff4444' : '#333333',
      color: variant === 'primary' ? '#000000' : '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      transition: 'all 0.2s',
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px',
    } as const,
    card: {
      backgroundColor: '#262626',
      padding: '20px',
      borderRadius: '6px',
      border: '1px solid #333333',
    } as const,
  };

  return (
    <div style={styles.container}>
      {toast && (
        <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}

      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900 }}>Financiamento</h1>
          <p style={{ margin: '8px 0 0', color: '#aaaaaa', fontSize: '14px' }}>
            Gerencie o conteúdo da página de financiamento
          </p>
        </div>
        <Link
          href="/financiamento"
          target="_blank"
          style={{
            ...styles.button('secondary'),
            padding: '10px 20px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          👁 Ver Página
        </Link>
      </div>

      {/* Seção: Textos Principais */}
      <div style={styles.section}>
        <h2 style={{ margin: '0 0 30px', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          📝 Textos Principais
        </h2>

        <div>
          <label style={styles.label}>Título do Hero</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => salvarConfig('financiamento_titulo', titulo, 'titulo')}
            disabled={salvandoId === 'titulo'}
            style={{ ...styles.button('primary'), marginTop: '10px' }}
          >
            {salvandoId === 'titulo' ? '⏳ Salvando...' : '💾 Salvar Título'}
          </button>
        </div>

        <div>
          <label style={styles.label}>Subtítulo</label>
          <input
            type="text"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => salvarConfig('financiamento_subtitulo', subtitulo, 'subtitulo')}
            disabled={salvandoId === 'subtitulo'}
            style={{ ...styles.button('primary'), marginTop: '10px' }}
          >
            {salvandoId === 'subtitulo' ? '⏳ Salvando...' : '💾 Salvar Subtítulo'}
          </button>
        </div>

        <div>
          <label style={styles.label}>Destaque (Badge Dourado)</label>
          <input
            type="text"
            value={destaque}
            onChange={(e) => setDestaque(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => salvarConfig('financiamento_destaque', destaque, 'destaque')}
            disabled={salvandoId === 'destaque'}
            style={{ ...styles.button('primary'), marginTop: '10px' }}
          >
            {salvandoId === 'destaque' ? '⏳ Salvando...' : '💾 Salvar Destaque'}
          </button>
        </div>
      </div>

      {/* Seção: Diferenciais */}
      <div style={styles.section}>
        <h2 style={{ margin: '0 0 30px', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          ⚡ Diferenciais (4 Cards)
        </h2>

        <div style={styles.grid}>
          {diferenciais.map((item, idx) => (
            <div key={idx} style={styles.card}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{item.icone}</div>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700 }}>{item.titulo}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaaaaa' }}>{item.descricao}</p>
              <button
                onClick={() =>
                  setModalDiferencial({ aberto: true, idx, dados: item })
                }
                style={{ ...styles.button('secondary'), marginTop: '12px', width: '100%' }}
              >
                ✏ Editar
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setModalDiferencial({ aberto: true })}
          style={{ ...styles.button('primary'), marginTop: '20px' }}
        >
          ➕ Adicionar Diferencial
        </button>

        {modalDiferencial.aberto && (
          <ModalDiferencial
            item={modalDiferencial.dados}
            idx={modalDiferencial.idx}
            onClose={() => setModalDiferencial({ aberto: false })}
            onSave={(item, idx) => {
              const novosDiferenciais = [...diferenciais];
              if (idx !== undefined) {
                novosDiferenciais[idx] = item;
              } else {
                novosDiferenciais.push(item);
              }
              setDiferenciais(novosDiferenciais);
              salvarConfig('financiamento_diferenciais', novosDiferenciais, 'diferenciais');
              setModalDiferencial({ aberto: false });
            }}
            styles={styles}
          />
        )}
      </div>

      {/* Seção: Vantagens */}
      <div style={styles.section}>
        <h2 style={{ margin: '0 0 30px', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          ✓ Vantagens
        </h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={novaVantagem}
            onChange={(e) => setNovaVantagem(e.target.value)}
            placeholder="Digite uma vantagem..."
            style={{ ...styles.input, flex: 1 }}
          />
          <button
            onClick={() => {
              if (novaVantagem.trim()) {
                const novasVantagens = [...vantagens, novaVantagem];
                setVantagens(novasVantagens);
                setNovaVantagem('');
                salvarConfig('financiamento_vantagens', novasVantagens, 'vantagens');
              }
            }}
            style={styles.button('primary')}
          >
            ➕ Adicionar
          </button>
        </div>

        <div>
          {vantagens.map((vantagem, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #333333' }}>
              <span>{vantagem}</span>
              <button
                onClick={() => {
                  const novasVantagens = vantagens.filter((_, i) => i !== idx);
                  setVantagens(novasVantagens);
                  salvarConfig('financiamento_vantagens', novasVantagens, 'vantagens');
                }}
                style={styles.button('danger')}
              >
                🗑 Deletar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Seção: Como Funciona */}
      <div style={styles.section}>
        <h2 style={{ margin: '0 0 30px', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          🔄 Como Funciona (4 Passos)
        </h2>

        <div style={styles.grid}>
          {passos.map((passo, idx) => (
            <div key={idx} style={styles.card}>
              <div style={{ fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>
                {passo.numero}
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700 }}>{passo.titulo}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaaaaa' }}>{passo.descricao}</p>
              <button
                onClick={() =>
                  setModalPasso({ aberto: true, idx, dados: passo })
                }
                style={{ ...styles.button('secondary'), marginTop: '12px', width: '100%' }}
              >
                ✏ Editar
              </button>
            </div>
          ))}
        </div>

        {modalPasso.aberto && (
          <ModalPasso
            item={modalPasso.dados}
            idx={modalPasso.idx}
            onClose={() => setModalPasso({ aberto: false })}
            onSave={(item, idx) => {
              const nossosPassos = [...passos];
              if (idx !== undefined) {
                nossosPassos[idx] = item;
              } else {
                nossosPassos.push(item);
              }
              setPassos(nossosPassos);
              salvarConfig('financiamento_passos', nossosPassos, 'passos');
              setModalPasso({ aberto: false });
            }}
            styles={styles}
          />
        )}
      </div>

      <Link
        href="/admin/dashboard"
        style={{
          display: 'inline-block',
          marginTop: '40px',
          padding: '12px 24px',
          backgroundColor: '#333333',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        ← Voltar ao Dashboard
      </Link>
    </div>
  );
}

function ModalDiferencial({
  item,
  idx,
  onClose,
  onSave,
  styles,
}: {
  item?: Diferencial;
  idx?: number;
  onClose: () => void;
  onSave: (item: Diferencial, idx?: number) => void;
  styles: any;
}) {
  const [titulo, setTitulo] = useState(item?.titulo || '');
  const [descricao, setDescricao] = useState(item?.descricao || '');
  const [icone, setIcone] = useState(item?.icone || '⭐');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #333333',
          maxWidth: '500px',
          width: '90%',
          color: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 800 }}>
          {idx !== undefined ? 'Editar Diferencial' : 'Novo Diferencial'}
        </h3>

        <label style={styles.label}>Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Descrição</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Ícone (emoji)</label>
        <input
          type="text"
          value={icone}
          onChange={(e) => setIcone(e.target.value)}
          style={styles.input}
          maxLength={2}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() =>
              onSave({ titulo, descricao, icone }, idx)
            }
            style={{ ...styles.button('primary'), flex: 1 }}
          >
            💾 Salvar
          </button>
          <button
            onClick={onClose}
            style={{ ...styles.button('secondary'), flex: 1 }}
          >
            ✕ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalPasso({
  item,
  idx,
  onClose,
  onSave,
  styles,
}: {
  item?: Passo;
  idx?: number;
  onClose: () => void;
  onSave: (item: Passo, idx?: number) => void;
  styles: any;
}) {
  const [titulo, setTitulo] = useState(item?.titulo || '');
  const [descricao, setDescricao] = useState(item?.descricao || '');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #333333',
          maxWidth: '500px',
          width: '90%',
          color: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 800 }}>
          {idx !== undefined ? 'Editar Passo' : 'Novo Passo'}
        </h3>

        <label style={styles.label}>Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Descrição</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={styles.input}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() =>
              onSave({ numero: (item?.numero || idx || 0) + 1, titulo, descricao }, idx)
            }
            style={{ ...styles.button('primary'), flex: 1 }}
          >
            💾 Salvar
          </button>
          <button
            onClick={onClose}
            style={{ ...styles.button('secondary'), flex: 1 }}
          >
            ✕ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
