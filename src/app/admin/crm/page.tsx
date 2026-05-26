import { query } from '@/lib/db';
import Link from 'next/link';
import './crm-dashboard.css';

export const dynamic = 'force-dynamic';

const ETAPAS_COR: Record<string, string> = {
  'Novo': '#5b9cf6',
  'Contactado': '#e8a832',
  'Negociação': '#9b7fe8',
  'Ganho': '#28a745',
  'Perdido': '#dc3545',
};

function formatarData(data: string | Date): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

function diasAtras(timestamp: string | null): string {
  if (!timestamp) return 'Sem interações';
  const dias = Math.floor((Date.now() - new Date(timestamp).getTime()) / 86400000);
  if (dias === 0) return 'hoje';
  if (dias === 1) return '1 dia atrás';
  return `${dias} dias atrás`;
}

function formatarMoeda(valor: number | null): string {
  if (!valor) return '—';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function CrmDashboardPage() {
  const [
    totalRows,
    porEtapa,
    vencidas,
    novos7d,
    ganhos,
    leadsRecentes,
    tarefasHoje,
    porOrigem,
    leadsEsfriando,
  ] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM TAB_LEAD'),
    query(
      `SELECT e.nome AS etapa, e.cor, COUNT(l.id) AS total
       FROM TAB_LEAD_ETAPA e
       LEFT JOIN TAB_LEAD l ON l.etapa_id = e.id
       GROUP BY e.id, e.nome, e.cor
       ORDER BY e.ordem`
    ),
    query(`SELECT COUNT(*) AS total FROM TAB_LEAD_TAREFA WHERE status = 'pendente' AND prazo < CURRENT_DATE`),
    query(`SELECT COUNT(*) AS total FROM TAB_LEAD WHERE criado_em >= NOW() - INTERVAL '7 days'`),
    query(`SELECT COUNT(*) AS total FROM TAB_LEAD l JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id WHERE e.nome = 'Ganho'`),
    query(
      `SELECT l.id, l.nome, l.email, l.origem, l.criado_em,
              e.nome AS etapa_nome, e.cor AS etapa_cor
       FROM TAB_LEAD l
       LEFT JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id
       ORDER BY l.criado_em DESC LIMIT 5`
    ),
    query(
      `SELECT t.id, t.lead_id, t.descricao, t.prazo, t.status,
              l.nome AS lead_nome
       FROM TAB_LEAD_TAREFA t
       JOIN TAB_LEAD l ON t.lead_id = l.id
       WHERE t.status = 'pendente'
         AND (t.prazo <= CURRENT_DATE OR t.prazo IS NULL)
       ORDER BY t.prazo ASC NULLS LAST
       LIMIT 8`
    ),
    query(`SELECT origem, COUNT(*) AS total FROM TAB_LEAD GROUP BY origem ORDER BY total DESC`),
    query(
      `SELECT l.id, l.nome, e.nome AS etapa_nome, e.cor AS etapa_cor,
              MAX(i.criado_em) AS ultima_interacao
       FROM TAB_LEAD l
       LEFT JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id
       LEFT JOIN TAB_LEAD_INTERACAO i ON i.lead_id = l.id
       WHERE LOWER(e.nome) NOT IN ('ganho', 'perdido')
       GROUP BY l.id, l.nome, e.nome, e.cor
       HAVING MAX(i.criado_em) < NOW() - INTERVAL '3 days'
          OR MAX(i.criado_em) IS NULL
       ORDER BY ultima_interacao ASC NULLS FIRST
       LIMIT 5`
    ),
  ]);

  const total = parseInt(totalRows[0]?.total ?? '0');
  const totalGanhos = parseInt(ganhos[0]?.total ?? '0');
  const taxa = total > 0 ? Math.round((totalGanhos / total) * 100) : 0;
  const maxOrigem = Math.max(...porOrigem.map((r: any) => parseInt(r.total)), 1);

  const ticketRows = await query(
    `SELECT AVG(valor_estimado) AS ticket
     FROM TAB_LEAD l
     JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id
     WHERE e.nome IN ('Negociação', 'Ganho') AND l.valor_estimado IS NOT NULL`
  );
  const ticket = ticketRows[0]?.ticket ? parseFloat(ticketRows[0].ticket) : null;

  return (
    <div className="paginaCrm">
      <div className="cabecalho">
        <h1 className="tituloPagina">CRM — Gestão de Leads</h1>
        <Link href="/admin/dashboard" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>
          ← Voltar ao Painel
        </Link>
      </div>

      <nav className="navCrm">
        <Link href="/admin/crm" className="linkNav linkNavAtivo">Dashboard</Link>
        <Link href="/admin/crm/leads" className="linkNav">Leads</Link>
        <Link href="/admin/crm/funil" className="linkNav">Funil</Link>
        <Link href="/admin/crm/tarefas" className="linkNav">Tarefas</Link>
        <Link href="/admin/crm/relatorios" className="linkNav">Relatórios</Link>
        <Link href="/admin/crm/configuracoes" className="linkNav">Configurações</Link>
      </nav>

      {/* Métricas */}
      <div className="gridMetricas">
        <div className="cardMetrica">
          <div className="labelMetrica">Total de Leads</div>
          <div className="valorMetrica">{total}</div>
        </div>
        <div className="cardMetrica">
          <div className="labelMetrica">Taxa de Conversão</div>
          <div className="valorMetrica valorMetricaDourado">{taxa}%</div>
        </div>
        <div className="cardMetrica">
          <div className="labelMetrica">Ticket Médio</div>
          <div className="valorMetrica valorMetricaDourado">{formatarMoeda(ticket)}</div>
        </div>
        <div className="cardMetrica">
          <div className="labelMetrica">Tarefas Vencidas</div>
          <div className={`valorMetrica ${parseInt(vencidas[0]?.total) > 0 ? 'valorMetricaPerigo' : ''}`}>
            {parseInt(vencidas[0]?.total ?? '0')}
          </div>
        </div>
      </div>

      <div className="gridPrincipal">
        <div className="colunaPrincipal">
          {/* Leads Recentes */}
          <div className="card">
            <div className="cardTitulo">
              Leads Recentes
              <Link href="/admin/crm/leads" className="linkVerTodos">Ver todos →</Link>
            </div>
            {leadsRecentes.length === 0 ? (
              <p className="semDados">Nenhum lead cadastrado ainda.</p>
            ) : (
              <table className="tabelaLeads">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Etapa</th>
                    <th>Origem</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsRecentes.map((lead: any) => (
                    <tr key={lead.id} onClick={() => {}}>
                      <td>
                        <Link href={`/admin/crm/leads/${lead.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                          <div className="nomeColuna">{lead.nome}</div>
                          <div className="emailColuna">{lead.email}</div>
                        </Link>
                      </td>
                      <td>
                        <span
                          className="badgeEtapa"
                          style={{ backgroundColor: lead.etapa_cor ?? '#333' }}
                        >
                          {lead.etapa_nome ?? 'Novo'}
                        </span>
                      </td>
                      <td>
                        <span className="badgeOrigem">{lead.origem}</span>
                      </td>
                      <td className="dataColuna">{formatarData(lead.criado_em)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Tarefas do Dia */}
          <div className="card">
            <div className="cardTitulo">Tarefas do Dia / Vencidas</div>
            {tarefasHoje.length === 0 ? (
              <p className="semDados">Sem tarefas pendentes para hoje.</p>
            ) : (
              <div className="listaTarefas">
                {tarefasHoje.map((tarefa: any) => {
                  const vencida = tarefa.prazo && new Date(tarefa.prazo) < new Date();
                  return (
                    <div key={tarefa.id} className="itemTarefa">
                      <input type="checkbox" className="checkboxTarefa" defaultChecked={tarefa.status === 'concluida'} readOnly />
                      <div style={{ flex: 1 }}>
                        <div className="textoTarefa">{tarefa.descricao}</div>
                        <div className="leadTarefa">
                          <Link href={`/admin/crm/leads/${tarefa.lead_id}`} style={{ color: '#555', textDecoration: 'none' }}>
                            {tarefa.lead_nome}
                          </Link>
                        </div>
                      </div>
                      {tarefa.prazo && (
                        <div className={`prazoTarefa ${vencida ? 'prazoVencido' : ''}`}>
                          {formatarData(tarefa.prazo)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leads Esfriando */}
          {leadsEsfriando.length > 0 && (
            <div className="card">
              <div className="cardTitulo">Leads Esfriando</div>
              <div className="listaEsfriando">
                {leadsEsfriando.map((lead: any) => (
                  <Link
                    key={lead.id}
                    href={`/admin/crm/leads/${lead.id}`}
                    className="itemEsfriando"
                  >
                    <div className="nomeEsfriando">
                      {lead.nome}
                      <span
                        className="badgeEtapa"
                        style={{ backgroundColor: lead.etapa_cor ?? '#333' }}
                      >
                        {lead.etapa_nome}
                      </span>
                    </div>
                    {lead.ultima_interacao ? (
                      <span className="ultimaInteracao">
                        Última interação: {diasAtras(lead.ultima_interacao)}
                      </span>
                    ) : (
                      <span className="semInteracao">Sem interações</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="colunaLateral">
          {/* Funil */}
          <div className="card">
            <div className="cardTitulo">Funil de Vendas</div>
            {porEtapa.map((etapa: any) => {
              const count = parseInt(etapa.total);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={etapa.etapa} className="itemFunil">
                  <span className="labelFunil">{etapa.etapa}</span>
                  <div className="barraFunilContainer">
                    <div
                      className="barraFunil"
                      style={{ width: `${pct}%`, backgroundColor: etapa.cor }}
                    />
                  </div>
                  <span className="contagemFunil">{count}</span>
                </div>
              );
            })}
            <hr className="separador" />
            <div className="linhaConversao">
              <span className="textoConversao">Taxa de conversão</span>
              <span className="percentualConversao">{taxa}%</span>
            </div>
            <div className="barraConversaoContainer">
              <div className="barraConversao" style={{ width: `${taxa}%` }} />
            </div>
          </div>

          {/* Origem */}
          <div className="card">
            <div className="cardTitulo">Origem dos Leads</div>
            <div className="gridOrigens">
              {porOrigem.map((orig: any) => {
                const count = parseInt(orig.total);
                const pct = (count / maxOrigem) * 100;
                return (
                  <div key={orig.origem} className="colunaOrigem">
                    <div className="valorOrigem">{count}</div>
                    <div className="barraOrigem" style={{ height: `${Math.max(pct, 4)}%` }} />
                    <div className="labelOrigem">{orig.origem}</div>
                  </div>
                );
              })}
              {porOrigem.length === 0 && <p className="semDados">Sem dados.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
