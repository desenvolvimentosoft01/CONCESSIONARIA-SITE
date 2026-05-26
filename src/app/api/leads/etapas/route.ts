import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const etapas = await query('SELECT * FROM TAB_LEAD_ETAPA ORDER BY ordem');
    return NextResponse.json(etapas);
  } catch (error) {
    console.error('[ETAPAS GET]', error);
    return NextResponse.json({ erro: 'Erro ao buscar etapas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nome, cor } = await request.json();

    if (!nome?.trim()) {
      return NextResponse.json({ erro: 'Nome obrigatório' }, { status: 400 });
    }

    const ordemRows = await query('SELECT COALESCE(MAX(ordem), 0) AS max_ordem FROM TAB_LEAD_ETAPA');
    const ordem = parseInt(ordemRows[0].max_ordem) + 1;

    const result = await query(
      'INSERT INTO TAB_LEAD_ETAPA (nome, cor, ordem) VALUES ($1, $2, $3) RETURNING *',
      [nome.trim(), cor || '#888888', ordem]
    );

    const { usuario } = getClientInfo(request);
    await registrarAuditoria({
      usuario,
      acao: 'CREATE',
      tabela: 'TAB_LEAD_ETAPA',
      registroId: result[0].id,
      dadosAntes: null,
      dadosDepois: result[0],
    });

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[ETAPAS POST]', error);
    return NextResponse.json({ erro: 'Erro ao criar etapa' }, { status: 500 });
  }
}
