import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';
import { NextRequest, NextResponse } from 'next/server';

async function resolveId(
  context: { params: { id: string } | Promise<{ id: string }> }
): Promise<string | undefined> {
  const params = 'params' in context ? context.params : undefined;
  const resolved = params && 'then' in params ? await params : params;
  return resolved?.id;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await resolveId(context);
  if (!id) return NextResponse.json({ erro: 'ID não fornecido' }, { status: 400 });

  try {
    const rows = await query(
      `SELECT * FROM TAB_LEAD_INTERACAO WHERE lead_id = $1 ORDER BY criado_em DESC`,
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[INTERACOES GET]', error);
    return NextResponse.json({ erro: 'Erro ao buscar interações' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await resolveId(context);
  if (!id) return NextResponse.json({ erro: 'ID não fornecido' }, { status: 400 });

  try {
    const body = await request.json();
    const { tipo, texto } = body;

    if (!tipo || !texto) {
      return NextResponse.json({ erro: 'Tipo e texto são obrigatórios' }, { status: 400 });
    }

    const { usuario } = getClientInfo(request);

    const result = await query(
      `INSERT INTO TAB_LEAD_INTERACAO (lead_id, tipo, texto, usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, tipo, texto, usuario]
    );

    await registrarAuditoria({
      usuario,
      acao: 'CREATE',
      tabela: 'TAB_LEAD_INTERACAO',
      registroId: result[0].id,
      dadosDepois: result[0],
    });

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[INTERACOES POST]', error);
    return NextResponse.json({ erro: 'Erro ao registrar interação' }, { status: 500 });
  }
}
