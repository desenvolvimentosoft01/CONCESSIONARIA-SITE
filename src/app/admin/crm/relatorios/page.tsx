import { query } from '@/lib/db';
import Link from 'next/link';
import GraficoMeses from './GraficoMeses';
import ExportarCSV from './ExportarCSV';
import './crm-relatorios.css';

export const dynamic = 'force-dynamic';

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatarMoeda(v: number | null): string {
  if (!v) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(d: string): string {
  return new Date(d).toLocaleDateString('pt-BR');
}

export default async function RelatoriosPage() {
  const agora = new Date();

  const [
    leads30d,
    ganhos30d,
    perdidos30d,
    tempoMedio,
    porMes,
    porEtapa,
    leadsGanhos,
    valorNegociacao,
  ] = await Promise.all([
    query(`SELECT COUNT(*) AS total FROM TAB_LEAD WHERE criado_em >= NOW() - INTERVAL '30 days'`),
    query(`SELECT COUNT(*) AS total FROM TAB_LEAD l JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id WHERE e.nome = 'Ganho' AND l.criado_em >= NOW() - INTERVAL '30 days'`),
    query(`SELECT COUNT(*) AS total FROM TAB_LEAD l JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id WHERE e.nome = 'Perdido' AND l.criado_em >= NOW() - INTERVAL '30 days'`),
    query(`SELECT AVG(EXTRACT(DAY FROM (atualizado_em - criado_em)))::int AS dias FROM TAB_LEAD l JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id WHERE e.nome = 'Ganho'`),
    query(`SELECT DATE_TRUNC('month', criado_em) AS mes, COUNT(*) AS total FROM TAB_LEAD GROUP BY mes ORDER BY mes DESC LIMIT 6`),
    query(`SELECT e.nome AS etapa, e.cor, COUNT(l.id) AS total FROM TAB_LEAD_ETAPA e LEFT JOIN TAB_LEAD l ON l.etapa_id = e.id GROUP BY e.id, e.nome, e.cor ORDER BY e.ordem`),
    query(`SELECT l.nome, c.modelo AS veiculo, l.valor_estimado, l.atualizado_em FROM TAB_LEAD l JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id LEFT JOIN TAB_CARRO c ON l.carro_id = c.id WHERE e.nome = 'Ganho' ORDER BY l.atualizado_em DESC LIMIT 10`),
    query(`SELECT SUM(l.valor_estimado) AS total FROM TAB_LEAD l JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id WHERE LOWER(e.nome) NOT IN ('ganho', 'perdido') AND l.valor_estimado IS NOT NULL`),
  ]);

  const mesesOrdenados = [...porMes].reverse();
  const totalLeads = porEtapa.reduce((s: number, r: any) => s + parseInt(r.total), 0);
  const valorEmNegociacao: number | null = valorNegociacao[0]?.total ? parseFloat(valorNegociacao[0].total) : null;

  const dadosGrafico = mesesOrdenados.map((r: any) => {
    const d = new Date(r.mes);
    return {
      label: MESES_PT[d.getMonth()],
      total: parseInt(r.total),
      atual: d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear(),
    };
  });

  return (
    <div className="paginaRelatorios">
      <div className="cabecalho">
        <h1 className="tituloPagina">Relatórios</h1>
        <Link href="/admin/dashboard" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>← Painel</Link>
      </div>

      <nav className="navCrm">
        <Link href="/admin/crm" className="linkNav">Dashboard</Link>
        <Link href="/admin/crm/leads" className="linkNav">Leads</Link>
        <Link href="/admin/crm/funil" className="linkNav">Funil</Link>
        <Link href="/admin/crm/tarefas" className="linkNav">Tarefas</Link>
        <Link href="/admin/crm/relatorios" className="linkNav linkNavAtivo">Relatórios</Link>
        <Link href="/admin/crm/configuracoes" className="linkNav">Configurações</Link>
      </nav>

      <div className="gridMetricas">
        <div className="cardMetrica">
          <div className="labelMetrica">Leads (30d)</div>
          <div className="valorMetrica">{leads30d[0]?.total ?? 0}</div>
        </div>
        <div className="cardMetrica">
          <div className="labelMetrica">Ganhos (30d)</div>
          <div className="valorMetrica valorMetricaVerde">{ganhos30d[0]?.total ?? 0}</div>
        </div>
        <div className="cardMetrica">
          <div className="labelMetrica">Perdidos (30d)</div>
          <div className="valorMetrica valorMetricaVermelho">{perdidos30d[0]?.total ?? 0}</div>
        </div>
        <div className="cardMetrica">
          <div className="labelMetrica">Tempo Médio</div>
          <div className="valorMetrica">{tempoMedio[0]?.dias ?? 0}d</div>
        </div>
        <div className="cardMetrica">
          <div className="labelMetrica">Valor em Negociação</div>
          <div className="valorMetrica valorMetricaDourado">{formatarMoeda(valorEmNegociacao)}</div>
        </div>
      </div>

      <div className="gridGraficos">
        <div className="card">
          <div className="cardTitulo">Leads por mês (últimos 6)</div>
          <GraficoMeses dados={dadosGrafico} />
        </div>

        <div className="card">
          <div className="cardTitulo">Conversão por etapa</div>
          {porEtapa.map((e: any) => {
            const count = parseInt(e.total);
            const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            return (
              <div key={e.etapa} className="linhaFunil">
                <span className="labelFunil">{e.etapa}</span>
                <div className="barraFunilContainer">
                  <div className="barraFunil" style={{ width: `${pct}%`, backgroundColor: e.cor }} />
                </div>
                <span className="contagemFunil">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cardTabela">
        <div className="cabecalhoCard">
          <div className="cardTitulo" style={{ marginBottom: 0 }}>Leads Ganhos</div>
          <ExportarCSV leads={leadsGanhos} />
        </div>
        {leadsGanhos.length === 0 ? (
          <p className="semDados">Nenhum lead ganho ainda.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Veículo</th>
                <th>Valor Fechado</th>
                <th>Data de Fechamento</th>
              </tr>
            </thead>
            <tbody>
              {leadsGanhos.map((l: any, i: number) => (
                <tr key={i}>
                  <td>{l.nome}</td>
                  <td>{l.veiculo ?? '—'}</td>
                  <td className="valorGanho">{formatarMoeda(l.valor_estimado)}</td>
                  <td>{formatarData(l.atualizado_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
