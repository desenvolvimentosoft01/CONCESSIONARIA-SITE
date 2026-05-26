import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalRows,
      porEtapa,
      vencidas,
      novos7d,
      ganhos,
      porOrigem,
      esfriando,
    ] = await Promise.all([
      query('SELECT COUNT(*) AS total FROM TAB_LEAD'),
      query(
        `SELECT e.id AS etapa_id, e.nome AS etapa, e.cor, COUNT(l.id) AS total
         FROM TAB_LEAD_ETAPA e
         LEFT JOIN TAB_LEAD l ON l.etapa_id = e.id
         GROUP BY e.id, e.nome, e.cor
         ORDER BY e.ordem`
      ),
      query(
        `SELECT COUNT(*) AS total FROM TAB_LEAD_TAREFA
         WHERE status = 'pendente' AND prazo < CURRENT_DATE`
      ),
      query(
        `SELECT COUNT(*) AS total FROM TAB_LEAD
         WHERE criado_em >= NOW() - INTERVAL '7 days'`
      ),
      query(
        `SELECT COUNT(*) AS total FROM TAB_LEAD l
         JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id
         WHERE e.nome = 'Ganho'`
      ),
      query(
        `SELECT origem, COUNT(*) AS total FROM TAB_LEAD GROUP BY origem ORDER BY total DESC`
      ),
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

    const total = parseInt(totalRows[0].total);
    const totalGanhos = parseInt(ganhos[0].total);
    const taxaConversao =
      total > 0 ? `${Math.round((totalGanhos / total) * 100)}%` : '0%';

    return NextResponse.json({
      totalLeads: total,
      leadsPorEtapa: porEtapa.map((r: any) => ({
        etapa_id: r.etapa_id,
        etapa: r.etapa,
        cor: r.cor,
        total: parseInt(r.total),
      })),
      tarefasVencidas: parseInt(vencidas[0].total),
      leadsNovos7d: parseInt(novos7d[0].total),
      taxaConversao,
      leadsPorOrigem: porOrigem.map((r: any) => ({
        origem: r.origem,
        total: parseInt(r.total),
      })),
      leadsEsfriando: esfriando.map((r: any) => ({
        id: r.id,
        nome: r.nome,
        etapa_nome: r.etapa_nome,
        etapa_cor: r.etapa_cor,
        ultima_interacao: r.ultima_interacao ?? null,
      })),
    });
  } catch (error) {
    console.error('[LEADS DASHBOARD]', error);
    return NextResponse.json({ erro: 'Erro ao buscar métricas' }, { status: 500 });
  }
}
