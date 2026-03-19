'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Log {
  id: number;
  usuario: string;
  acao: string;
  tabela: string;
  registro_id: number;
  dados_antes: string;
  dados_depois: string;
  data_hora: string;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroTabela, setFiltroTabela] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');
  const [logSelecionado, setLogSelecionado] = useState<Log | null>(null);

  function compararObjetos(antes: any, depois: any) {
    const diferencas: { campo: string; antes: any; depois: any }[] = [];
    
    const todasChaves = new Set([...Object.keys(antes || {}), ...Object.keys(depois || {})]);
    
    todasChaves.forEach(chave => {
      const valorAntes = antes?.[chave];
      const valorDepois = depois?.[chave];
      
      if (JSON.stringify(valorAntes) !== JSON.stringify(valorDepois)) {
        diferencas.push({
          campo: chave,
          antes: valorAntes,
          depois: valorDepois
        });
      }
    });
    
    return diferencas;
  }

  useEffect(() => {
    carregarLogs();
  }, [filtroUsuario, filtroTabela, filtroAcao]);

  async function carregarLogs() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroUsuario) params.append('usuario', filtroUsuario);
      if (filtroTabela) params.append('tabela', filtroTabela);
      if (filtroAcao) params.append('acao', filtroAcao);

      const res = await fetch(`/api/auditoria?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR');
  }

  function getAcaoCor(acao: string) {
    switch (acao) {
      case 'CREATE': return '#28a745';
      case 'UPDATE': return '#ffc107';
      case 'DELETE': return '#dc3545';
      default: return '#6c757d';
    }
  }

  function getTabelaNome(tabela: string) {
    switch (tabela) {
      case 'TAB_CARRO': return 'Veículo';
      case 'TAB_CARRO_IMAGEM': return 'Imagem/Vídeo';
      case 'TAB_MIDIA': return 'Mídia';
      case 'TAB_CONFIGURACAO': return 'Configuração';
      default: return tabela;
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link href="/admin/dashboard" style={styles.botaoVoltar}>← Voltar</Link>
          <h1 style={styles.titulo}>📋 Auditoria de Alterações</h1>
        </div>
      </div>

      <div style={styles.filtros}>
        <input
          type="text"
          placeholder="Filtrar por usuário..."
          value={filtroUsuario}
          onChange={(e) => setFiltroUsuario(e.target.value)}
          style={styles.input}
        />
        
        <select
          value={filtroTabela}
          onChange={(e) => setFiltroTabela(e.target.value)}
          style={styles.select}
        >
          <option value="">Todas as tabelas</option>
          <option value="TAB_CARRO">Veículos</option>
          <option value="TAB_CARRO_IMAGEM">Imagens/Vídeos</option>
          <option value="TAB_MIDIA">Mídias</option>
          <option value="TAB_CONFIGURACAO">Configurações</option>
        </select>

        <select
          value={filtroAcao}
          onChange={(e) => setFiltroAcao(e.target.value)}
          style={styles.select}
        >
          <option value="">Todas as ações</option>
          <option value="CREATE">Criação</option>
          <option value="UPDATE">Atualização</option>
          <option value="DELETE">Exclusão</option>
        </select>

        {(filtroUsuario || filtroTabela || filtroAcao) && (
          <button
            onClick={() => {
              setFiltroUsuario('');
              setFiltroTabela('');
              setFiltroAcao('');
            }}
            style={styles.botaoLimpar}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {carregando ? (
        <div style={styles.carregando}>Carregando logs...</div>
      ) : logs.length === 0 ? (
        <div style={styles.vazio}>Nenhum log encontrado</div>
      ) : (
        <div style={styles.tabela}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Data/Hora</th>
                <th style={styles.th}>Usuário</th>
                <th style={styles.th}>Ação</th>
                <th style={styles.th}>Tabela</th>
                <th style={styles.th}>ID Registro</th>
                <th style={styles.th}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={styles.tr}>
                  <td style={styles.td}>{formatarData(log.data_hora)}</td>
                  <td style={styles.td}>{log.usuario}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, backgroundColor: getAcaoCor(log.acao)}}>
                      {log.acao}
                    </span>
                  </td>
                  <td style={styles.td}>{getTabelaNome(log.tabela)}</td>
                  <td style={styles.td}>{log.registro_id || '-'}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => setLogSelecionado(log)}
                      style={styles.botaoDetalhes}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logSelecionado && (
        <div style={styles.modal} onClick={() => setLogSelecionado(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitulo}>Detalhes do Log #{logSelecionado.id}</h2>
              <button onClick={() => setLogSelecionado(null)} style={styles.botaoFechar}>✕</button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.infoGrid}>
                <div><strong>Usuário:</strong> {logSelecionado.usuario}</div>
                <div><strong>Ação:</strong> {logSelecionado.acao}</div>
                <div><strong>Tabela:</strong> {getTabelaNome(logSelecionado.tabela)}</div>
                <div><strong>Data/Hora:</strong> {formatarData(logSelecionado.data_hora)}</div>
                <div><strong>ID Registro:</strong> {logSelecionado.registro_id || '-'}</div>
              </div>

              {logSelecionado.acao === 'UPDATE' && logSelecionado.dados_antes && logSelecionado.dados_depois ? (
                <div style={styles.dadosBox}>
                  <h3 style={styles.dadosTitulo}>🔄 Alterações:</h3>
                  <table style={styles.diffTable}>
                    <thead>
                      <tr>
                        <th style={styles.diffTh}>Campo</th>
                        <th style={styles.diffTh}>Antes</th>
                        <th style={styles.diffTh}>Depois</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compararObjetos(
                        JSON.parse(logSelecionado.dados_antes),
                        JSON.parse(logSelecionado.dados_depois)
                      ).map((diff, index) => (
                        <tr key={index} style={styles.diffTr}>
                          <td style={styles.diffTd}><strong>{diff.campo}</strong></td>
                          <td style={{...styles.diffTd, ...styles.diffAntes}}>
                            {diff.antes !== undefined && diff.antes !== null ? String(diff.antes) : '-'}
                          </td>
                          <td style={{...styles.diffTd, ...styles.diffDepois}}>
                            {diff.depois !== undefined && diff.depois !== null ? String(diff.depois) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  {logSelecionado.dados_antes && (
                    <div style={styles.dadosBox}>
                      <h3 style={styles.dadosTitulo}>📄 Dados Antes:</h3>
                      <pre style={styles.pre}>{JSON.stringify(JSON.parse(logSelecionado.dados_antes), null, 2)}</pre>
                    </div>
                  )}

                  {logSelecionado.dados_depois && (
                    <div style={styles.dadosBox}>
                      <h3 style={styles.dadosTitulo}>📄 Dados Depois:</h3>
                      <pre style={styles.pre}>{JSON.stringify(JSON.parse(logSelecionado.dados_depois), null, 2)}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
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
  filtros: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  select: {
    flex: 1,
    minWidth: '200px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  botaoLimpar: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  carregando: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
    color: '#666'
  },
  vazio: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
    color: '#999',
    backgroundColor: 'white',
    borderRadius: '10px'
  },
  tabela: {
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  th: {
    padding: '12px',
    textAlign: 'left' as const,
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#495057'
  },
  tr: {
    borderBottom: '1px solid #dee2e6'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#212529'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold' as const
  },
  botaoDetalhes: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '10px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #dee2e6'
  },
  modalTitulo: {
    fontSize: '20px',
    color: '#333',
    margin: 0
  },
  botaoFechar: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  modalBody: {
    padding: '20px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  dadosBox: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px'
  },
  dadosTitulo: {
    fontSize: '16px',
    marginBottom: '10px',
    color: '#495057'
  },
  pre: {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '12px',
    border: '1px solid #dee2e6'
  },
  userAgent: {
    fontSize: '12px',
    color: '#666',
    wordBreak: 'break-all' as const
  },
  diffTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '10px'
  },
  diffTh: {
    padding: '10px',
    textAlign: 'left' as const,
    backgroundColor: '#e9ecef',
    borderBottom: '2px solid #dee2e6',
    fontSize: '13px',
    fontWeight: 'bold' as const
  },
  diffTr: {
    borderBottom: '1px solid #dee2e6'
  },
  diffTd: {
    padding: '10px',
    fontSize: '13px',
    verticalAlign: 'top' as const
  },
  diffAntes: {
    backgroundColor: '#ffebee',
    color: '#c62828'
  },
  diffDepois: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32'
  }
};
