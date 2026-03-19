'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  descricao: string;
  tipo: string;
  categoria: string;
}

export default function PersonalizacaoPage() {
  const [configs, setConfigs] = useState<Configuracao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    try {
      const res = await fetch('/api/configuracao');
      const data = await res.json();
      setConfigs(data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setCarregando(false);
    }
  }

  async function handleSalvar(chave: string, valor: string) {
    setSalvando(true);
    console.log('Salvando:', chave, valor);
    try {
      const res = await fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave, valor })
      });

      console.log('Resposta:', res.status);
      const data = await res.json();
      console.log('Data:', data);

      if (res.ok) {
        setMensagem('✅ Salvo com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        carregarConfiguracoes();
      } else {
        setMensagem('❌ ' + (data.erro || 'Erro ao salvar'));
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('❌ Erro ao salvar');
    } finally {
      setSalvando(false);
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
    const padrao: Record<string, string> = {
      cor_primaria: '#ff6b00',
      cor_secundaria: '#333333',
      cor_header: '#1a1a1a',
      cor_footer: '#1a1a1a',
      cor_botao_primario: '#ff6b00',
      cor_botao_secundario: '#333333',
      cor_whatsapp: '#25d366',
      cor_link: '#ff6b00',
      cor_sucesso: '#28a745',
      cor_erro: '#dc3545'
    };

    configs.forEach(config => {
      if (padrao[config.chave]) {
        handleSalvar(config.chave, padrao[config.chave]);
      }
    });
  }

  function getCorPadrao(chave: string): string {
    const padroes: Record<string, string> = {
      cor_primaria: '#ff6b00',
      cor_secundaria: '#333333',
      cor_header: '#1a1a1a',
      cor_footer: '#1a1a1a',
      cor_botao_primario: '#ff6b00',
      cor_botao_secundario: '#333333',
      cor_whatsapp: '#25d366',
      cor_link: '#ff6b00',
      cor_sucesso: '#28a745',
      cor_erro: '#dc3545'
    };
    return padroes[chave] || '#000000';
  }

  const coresPorCategoria = configs.reduce((acc, config) => {
    if (!acc[config.categoria]) acc[config.categoria] = [];
    acc[config.categoria].push(config);
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

      {mensagem && (
        <div style={styles.mensagem}>{mensagem}</div>
      )}

      {confirmOpen && (
        <ConfirmModal
          titulo="Resetar cores padrão"
          mensagem="Deseja realmente resetar todas as cores para o padrão?"
          confirmText="Sim, resetar"
          cancelText="Não"
          onConfirm={confirmarResetarPadrao}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      <div style={styles.aviso}>
        <strong>⚠️ Atenção:</strong> As alterações serão aplicadas em todo o site após salvar.
        Recarregue a página para ver as mudanças.
      </div>

      <div style={styles.content}>
        {Object.entries(coresPorCategoria).map(([categoria, items]) => (
          <div key={categoria} style={styles.categoria}>
            <h2 style={styles.categoriaTitulo}>
              {categoria === 'cores' ? '🎨 Cores' : categoria}
            </h2>
            
            <div style={styles.grid}>
              {items.map((config) => (
                <div key={config.id} style={styles.card}>
                  <label style={styles.label}>{config.descricao}</label>
                  
                  <div style={styles.inputGroup}>
                    <input
                      type="color"
                      value={config.valor}
                      onChange={(e) => handleChange(config.chave, e.target.value)}
                      style={styles.colorInput}
                    />
                    <input
                      type="text"
                      value={config.valor}
                      onChange={(e) => handleChange(config.chave, e.target.value)}
                      style={styles.textInput}
                      maxLength={7}
                    />
                    <button
                      onClick={() => handleSalvar(config.chave, config.valor)}
                      disabled={salvando}
                      style={styles.botaoSalvar}
                    >
                      Salvar
                    </button>
                  </div>

                  <div style={styles.previewContainer}>
                    <div style={styles.previewBox}>
                      <div style={{...styles.preview, backgroundColor: config.valor}}>
                        Atual
                      </div>
                      <span style={styles.previewLabel}>{config.valor}</span>
                    </div>
                    <div style={styles.previewBox}>
                      <div style={{...styles.preview, backgroundColor: getCorPadrao(config.chave)}}>
                        Padrão
                      </div>
                      <span style={styles.previewLabel}>{getCorPadrao(config.chave)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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
    fontSize: '14px'
  },
  mensagem: {
    padding: '15px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center' as const,
    fontSize: '16px'
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
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#495057',
    marginBottom: '10px'
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
    cursor: 'pointer'
  },
  textInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  botaoSalvar: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  preview: {
    height: '50px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold' as const,
    fontSize: '12px',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
  },
  previewContainer: {
    display: 'flex',
    gap: '10px'
  },
  previewBox: {
    flex: 1,
    textAlign: 'center' as const
  },
  previewLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#666',
    marginTop: '5px',
    fontFamily: 'monospace'
  },
  aviso: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '5px',
    fontSize: '14px'
  }
};
