'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function PersonalizacaoPage() {
  const [configs, setConfigs] = useState<Configuracao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{mensagem: string, tipo: 'sucesso' | 'erro' | 'aviso'} | null>(null);
  const [resetando, setResetando] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    try {
      const res = await fetch('/api/configuracao', { cache: 'no-store' });
      const data = await res.json();
      setConfigs(data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
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
        body: JSON.stringify({ chave: config.chave, valor: config.valor })
      });

      if (res.ok) {
        setToast({ mensagem: 'Configuração salva com sucesso!', tipo: 'sucesso' });
        // Não recarregamos tudo para não perder o foco, mas poderíamos
      } else {
        setToast({ mensagem: 'Erro ao salvar configuração', tipo: 'erro' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setToast({ mensagem: 'Erro de conexão ao salvar', tipo: 'erro' });
    } finally {
      setSalvandoId(null);
    }
  }

  function handleChange(chave: string, novoValor: string) {
    setConfigs(prev =>
      prev.map(c => c.chave === chave ? { ...c, valor: novoValor } : c)
    );
  }

  function resetarPadrao() {
    setConfirmOpen(true);
  }

  async function confirmarResetarPadrao() {
    setConfirmOpen(false);
    setResetando(true);
    
    // Lista completa com dados para criar se não existir
    const padraoDefinicoes = [
      { chave: 'cor_primaria', valor: '#ff6b00', descricao: 'Cor Primária' },
      { chave: 'cor_secundaria', valor: '#333333', descricao: 'Cor Secundária' },
      { chave: 'cor_fundo', valor: '#f5f5f5', descricao: 'Cor de Fundo' },
      { chave: 'cor_header', valor: '#ffffff', descricao: 'Cor do Cabeçalho' },
      { chave: 'cor_header_texto', valor: '#333333', descricao: 'Texto do Cabeçalho' },
      { chave: 'cor_footer', valor: '#1a1a1a', descricao: 'Cor do Rodapé' },
      { chave: 'cor_footer_texto', valor: '#ffffff', descricao: 'Texto do Rodapé' },
      { chave: 'cor_botao_primario', valor: '#ff6b00', descricao: 'Botão Primário' },
      { chave: 'cor_botao_texto', valor: '#ffffff', descricao: 'Texto do Botão' },
      { chave: 'cor_botao_secundario', valor: '#333333', descricao: 'Botão Secundário' },
      { chave: 'cor_whatsapp', valor: '#25d366', descricao: 'Botão WhatsApp' },
      { chave: 'cor_link', valor: '#ff6b00', descricao: 'Cor de Links' },
      { chave: 'cor_destaque', valor: '#ff6b00', descricao: 'Cor de Destaque' },
      { chave: 'cor_sucesso', valor: '#28a745', descricao: 'Cor de Sucesso' },
      { chave: 'cor_erro', valor: '#dc3545', descricao: 'Cor de Erro' }
    ];

    // Itera sobre a lista padrão (e não sobre configs vazio) para garantir a criação
    const promises = padraoDefinicoes.map(async (item) => {
      return fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chave: item.chave, 
          valor: item.valor,
          descricao: item.descricao, // Envia descrição caso esteja criando agora
          categoria: 'cores',
          tipo: 'color'
        })
      });
    });

    try {
      await Promise.all(promises);
      setToast({ mensagem: 'Configurações inicializadas com sucesso!', tipo: 'sucesso' });
      await carregarConfiguracoes();
    } catch (error) {
      setToast({ mensagem: 'Erro ao inicializar configurações', tipo: 'erro' });
    } finally {
      setResetando(false);
    }
  }

  function getCorPadrao(chave: string): string {
    const padroes: Record<string, string> = {
      cor_primaria: '#ff6b00',
      cor_secundaria: '#333333',
      cor_fundo: '#f5f5f5',
      cor_header: '#ffffff',
      cor_header_texto: '#333333',
      cor_footer: '#1a1a1a',
      cor_footer_texto: '#ffffff',
      cor_botao_primario: '#ff6b00',
      cor_botao_texto: '#ffffff',
      cor_botao_secundario: '#333333',
      cor_whatsapp: '#25d366',
      cor_link: '#ff6b00',
      cor_destaque: '#ff6b00',
      cor_sucesso: '#28a745',
      cor_erro: '#dc3545'
    };
    return padroes[chave] || '#cccccc';
  }

  const coresPorCategoria = configs.reduce((acc, config) => {
    const cat = config.categoria || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(config);
    return acc;
  }, {} as Record<string, Configuracao[]>);

  if (carregando) {
    return <div style={styles.carregando}>Carregando...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link href="/admin/dashboard" style={styles.botaoVoltar}>← Voltar</Link>
          <h1 style={styles.titulo}>🎨 Personalização do Site</h1>
        </div>
        <button onClick={resetarPadrao} style={styles.botaoResetar}>
          Resetar Padrão
        </button>
      </div>

      {confirmOpen && (
        <ConfirmModal
          titulo="Resetar cores padrão"
          mensagem="Deseja realmente resetar todas as cores para o padrão?"
          confirmText="Sim, resetar"
          cancelText="Não"
          onConfirm={confirmarResetarPadrao}
          onCancel={() => setConfirmOpen(false)}
          loading={resetando}
        />
      )}

      <div style={styles.aviso}>
        <strong>🎨 Dica:</strong> As cores definem a identidade visual do seu site. 
        Use o seletor de cores ou digite o código HEX. Salve cada item individualmente após alterar.
      </div>

      <div style={styles.content}>
        {configs.length === 0 && !carregando && (
          <div style={styles.vazio}>
            <p>Nenhuma configuração encontrada.</p>
            <p>Clique no botão <strong>"Resetar Padrão"</strong> acima para instalar as cores iniciais do site.</p>
            <button 
              onClick={resetarPadrao} 
              style={{...styles.botaoResetar, marginTop: '20px', backgroundColor: '#007bff'}}
            >
              Inicializar Configurações
            </button>
          </div>
        )}

        {Object.entries(coresPorCategoria).map(([categoria, items]) => (
          <div key={categoria} style={styles.categoria}>
            <h2 style={styles.categoriaTitulo}>
              {categoria === 'cores' ? '🎨 Cores do Site' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
            </h2>
            
            <div style={styles.grid}>
              {items.map((config) => (
                <div key={config.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <label style={styles.label}>{config.descricao || config.chave}</label>
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <input
                      type="color"
                      value={config.valor}
                      onChange={(e) => handleChange(config.chave, e.target.value)}
                      style={styles.colorInput}
                      title="Clique para escolher a cor"
                    />
                    <input
                      type="text"
                      value={config.valor}
                      onChange={(e) => handleChange(config.chave, e.target.value)}
                      style={styles.textInput}
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </div>

                  <div style={styles.previewContainer}>
                    <div style={styles.previewBox}>
                      <div 
                        style={{
                          ...styles.preview, 
                          backgroundColor: config.valor,
                          border: config.valor.toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none'
                        }}
                      >
                      </div>
                      <span style={styles.previewLabel}>Atual</span>
                    </div>
                    <div style={styles.previewBox}>
                      <div 
                        style={{
                          ...styles.preview, 
                          backgroundColor: getCorPadrao(config.chave),
                          opacity: 0.6,
                          border: getCorPadrao(config.chave).toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none'
                        }}
                      >
                      </div>
                      <span style={styles.previewLabel}>Padrão</span>
                    </div>

                    <button
                      onClick={() => handleSalvar(config)}
                      disabled={salvandoId === config.id}
                      style={salvandoId === config.id ? styles.botaoSalvarDisabled : styles.botaoSalvar}
                    >
                      {salvandoId === config.id ? '...' : '💾 Salvar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
  botaoResetar: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold' as const
  },
  carregando: {
    textAlign: 'center' as const,
    padding: '100px',
    fontSize: '18px',
    color: '#666'
  },
  content: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  categoria: {
    marginBottom: '30px'
  },
  categoriaTitulo: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #ff6b00'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  cardHeader: {
    marginBottom: '5px'
  },
  label: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    color: '#333'
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  colorInput: {
    width: '60px',
    height: '40px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    padding: '2px',
    backgroundColor: 'white'
  },
  textInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '15px',
    fontFamily: 'monospace',
    color: '#555',
    textTransform: 'uppercase' as const
  },
  botaoSalvar: {
    padding: '8px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    marginLeft: 'auto'
  },
  botaoSalvarDisabled: {
    padding: '8px 15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'wait',
    fontSize: '13px',
    marginLeft: 'auto',
    opacity: 0.7
  },
  preview: {
    height: '30px',
    width: '100%',
    borderRadius: '5px',
    marginBottom: '2px'
  },
  previewContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '5px',
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '5px'
  },
  previewBox: {
    width: '60px',
    textAlign: 'center' as const
  },
  previewLabel: {
    display: 'block',
    fontSize: '10px',
    color: '#666',
    textTransform: 'uppercase' as const
  },
  aviso: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '5px',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  vazio: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};
