'use client';

import { useState, useEffect } from 'react';

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

function compararObjetos(antes: any, depois: any) {
  const diffs: { campo: string; antes: any; depois: any }[] = [];
  const chaves = new Set([...Object.keys(antes || {}), ...Object.keys(depois || {})]);
  chaves.forEach(k => {
    if (JSON.stringify(antes?.[k]) !== JSON.stringify(depois?.[k])) {
      diffs.push({ campo: k, antes: antes?.[k], depois: depois?.[k] });
    }
  });
  return diffs;
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroTabela, setFiltroTabela] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [logSelecionado, setLogSelecionado] = useState<Log | null>(null);

  useEffect(() => { carregarLogs(); }, [filtroUsuario, filtroTabela, filtroAcao, dataInicio, dataFim]);

  async function carregarLogs() {
    setCarregando(true);
    try {
      const p = new URLSearchParams();
      if (filtroUsuario) p.append('usuario', filtroUsuario);
      if (filtroTabela) p.append('tabela', filtroTabela);
      if (filtroAcao) p.append('acao', filtroAcao);
      if (dataInicio) p.append('data_inicio', dataInicio);
      if (dataFim) p.append('data_fim', dataFim);
      const res = await fetch(`/api/auditoria?${p}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      console.error('Erro ao carregar logs');
    } finally {
      setCarregando(false);
    }
  }

  const acaoCor: Record<string, string> = { CREATE: '#28a745', UPDATE: '#f0a500', DELETE: '#dc3545' };
  const tabelaNome: Record<string, string> = {
    TAB_CARRO: 'Veículo', TAB_CARRO_IMAGEM: 'Imagem', TAB_MIDIA: 'Mídia', TAB_CONFIGURACAO: 'Configuração',
  };

  const temFiltro = filtroUsuario || filtroTabela || filtroAcao || dataInicio || dataFim;

  return (
    <div>
      {/* Filtros */}
      <div style={s.filtros}>
        <input type="text" placeholder="Filtrar por usuário..." value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)} style={s.input} />
        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={s.input} title="Data início" />
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={s.input} title="Data fim" />
        <select value={filtroTabela} onChange={e => setFiltroTabela(e.target.value)} style={s.select}>
          <option value="">Todas as tabelas</option>
          <option value="TAB_CARRO">Veículos</option>
          <option value="TAB_CARRO_IMAGEM">Imagens</option>
          <option value="TAB_MIDIA">Mídias</option>
          <option value="TAB_CONFIGURACAO">Configurações</option>
        </select>
        <select value={filtroAcao} onChange={e => setFiltroAcao(e.target.value)} style={s.select}>
          <option value="">Todas as ações</option>
          <option value="CREATE">Criação</option>
          <option value="UPDATE">Atualização</option>
          <option value="DELETE">Exclusão</option>
        </select>
        {temFiltro && (
          <button onClick={() => { setFiltroUsuario(''); setFiltroTabela(''); setFiltroAcao(''); setDataInicio(''); setDataFim(''); }} style={s.btnLimpar}>
            Limpar
          </button>
        )}
      </div>

      {carregando ? (
        <div style={s.estado}>Carregando...</div>
      ) : logs.length === 0 ? (
        <div style={s.estado}>Nenhum registro encontrado.</div>
      ) : (
        <div style={s.tabelaWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Data/Hora', 'Usuário', 'Ação', 'Tabela', 'ID', 'Detalhes'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={s.tr}>
                  <td style={s.td}>{new Date(log.data_hora).toLocaleString('pt-BR')}</td>
                  <td style={s.td}>{log.usuario}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, backgroundColor: acaoCor[log.acao] ?? '#555' }}>{log.acao}</span>
                  </td>
                  <td style={s.td}>{tabelaNome[log.tabela] ?? log.tabela}</td>
                  <td style={s.td}>{log.registro_id || '—'}</td>
                  <td style={s.td}>
                    <button onClick={() => setLogSelecionado(log)} style={s.btnVer}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {logSelecionado && (
        <div style={m.overlay} onClick={() => setLogSelecionado(null)}>
          <div style={m.box} onClick={e => e.stopPropagation()}>
            <div style={m.header}>
              <h2 style={m.titulo}>Log #{logSelecionado.id}</h2>
              <button onClick={() => setLogSelecionado(null)} style={m.btnFechar}>✕</button>
            </div>
            <div style={m.body}>
              <div style={m.infoGrid}>
                <div><span style={m.label}>Usuário</span>{logSelecionado.usuario}</div>
                <div><span style={m.label}>Ação</span><span style={{ ...s.badge, backgroundColor: acaoCor[logSelecionado.acao] ?? '#555' }}>{logSelecionado.acao}</span></div>
                <div><span style={m.label}>Tabela</span>{tabelaNome[logSelecionado.tabela] ?? logSelecionado.tabela}</div>
                <div><span style={m.label}>Data/Hora</span>{new Date(logSelecionado.data_hora).toLocaleString('pt-BR')}</div>
                <div><span style={m.label}>ID Registro</span>{logSelecionado.registro_id || '—'}</div>
              </div>

              {logSelecionado.acao === 'UPDATE' && logSelecionado.dados_antes && logSelecionado.dados_depois ? (
                <div style={m.dadosBox}>
                  <p style={m.dadosTitulo}>Alterações</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Campo', 'Antes', 'Depois'].map(h => <th key={h} style={m.diffTh}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {compararObjetos(JSON.parse(logSelecionado.dados_antes), JSON.parse(logSelecionado.dados_depois))
                        .map((d, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                            <td style={m.diffTd}><strong>{d.campo}</strong></td>
                            <td style={{ ...m.diffTd, color: '#ff8080', backgroundColor: '#1a0000' }}>{d.antes !== undefined && d.antes !== null ? String(d.antes) : '—'}</td>
                            <td style={{ ...m.diffTd, color: '#80ff80', backgroundColor: '#001a00' }}>{d.depois !== undefined && d.depois !== null ? String(d.depois) : '—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  {logSelecionado.dados_antes && (
                    <div style={m.dadosBox}>
                      <p style={m.dadosTitulo}>Dados Antes</p>
                      <pre style={m.pre}>{JSON.stringify(JSON.parse(logSelecionado.dados_antes), null, 2)}</pre>
                    </div>
                  )}
                  {logSelecionado.dados_depois && (
                    <div style={m.dadosBox}>
                      <p style={m.dadosTitulo}>Dados Depois</p>
                      <pre style={m.pre}>{JSON.stringify(JSON.parse(logSelecionado.dados_depois), null, 2)}</pre>
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

const s = {
  filtros: { display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 20 },
  input: { flex: 1, minWidth: 180, padding: '9px 12px', border: '1px solid #1a1a1a', borderRadius: 4, fontSize: 13, backgroundColor: '#111', color: '#ccc' } as const,
  select: { flex: 1, minWidth: 180, padding: '9px 12px', border: '1px solid #1a1a1a', borderRadius: 4, fontSize: 13, backgroundColor: '#111', color: '#ccc' } as const,
  btnLimpar: { padding: '9px 18px', backgroundColor: '#111', color: '#888', border: '1px solid #1a1a1a', borderRadius: 4, cursor: 'pointer', fontSize: 13 } as const,
  estado: { textAlign: 'center' as const, padding: 60, color: '#444', fontSize: 14 },
  tabelaWrapper: { backgroundColor: '#0d0d0d', borderRadius: 6, border: '1px solid #1a1a1a', overflow: 'auto' } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '12px 14px', textAlign: 'left' as const, backgroundColor: '#111', borderBottom: '1px solid #1a1a1a', fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase' as const, letterSpacing: 1 },
  tr: { borderBottom: '1px solid #111' } as const,
  td: { padding: '11px 14px', fontSize: 13, color: '#bbb' } as const,
  badge: { display: 'inline-block', padding: '3px 8px', borderRadius: 3, color: '#fff', fontSize: 11, fontWeight: 700 } as const,
  btnVer: { padding: '5px 12px', backgroundColor: '#111', color: '#888', border: '1px solid #1a1a1a', borderRadius: 4, cursor: 'pointer', fontSize: 12 } as const,
};

const m = {
  overlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  box: { backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, maxWidth: 800, width: '90%', maxHeight: '90vh', overflow: 'auto' } as const,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #1a1a1a' } as const,
  titulo: { margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' } as const,
  btnFechar: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#555', lineHeight: 1 } as const,
  body: { padding: 22 } as const,
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20, fontSize: 13, color: '#ccc' } as const,
  label: { display: 'block', fontSize: 10, color: '#555', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 } as const,
  dadosBox: { marginBottom: 16, padding: 16, backgroundColor: '#111', borderRadius: 4, border: '1px solid #1a1a1a' } as const,
  dadosTitulo: { fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase' as const, letterSpacing: 1, margin: '0 0 12px' } as const,
  diffTh: { padding: '8px 12px', textAlign: 'left' as const, backgroundColor: '#0a0a0a', borderBottom: '1px solid #1a1a1a', fontSize: 11, fontWeight: 700, color: '#555' } as const,
  diffTd: { padding: '8px 12px', fontSize: 12, verticalAlign: 'top' as const, color: '#aaa' } as const,
  pre: { backgroundColor: '#000', padding: 12, borderRadius: 4, overflow: 'auto', fontSize: 11, border: '1px solid #1a1a1a', color: '#aaa', margin: 0 } as const,
};
