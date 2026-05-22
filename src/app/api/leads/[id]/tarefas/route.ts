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
      `SELECT * FROM TAB_LEAD_TAREFA WHERE lead_id = $1 ORDER BY prazo ASC NULLS LAST`,
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[TAREFAS GET]', error);
    return NextResponse.json({ erro: 'Erro ao buscar tarefas' }, { status: 500 });
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
    const { tipo, descricao, prazo } = body;

    if (!descricao) {
      return NextResponse.json({ erro: 'Descrição é obrigatória' }, { status: 400 });
    }

    const { usuario } = getClientInfo(request);

    const result = await query(
      `INSERT INTO TAB_LEAD_TAREFA (lead_id, tipo, descricao, prazo, usuario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, tipo ?? null, descricao, prazo ?? null, usuario]
    );

    await registrarAuditoria({
      usuario,
      acao: 'CREATE',
      tabela: 'TAB_LEAD_TAREFA',
      registroId: result[0].id,
      dadosDepois: result[0],
    });

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[TAREFAS POST]', error);
    return NextResponse.json({ erro: 'Erro ao criar tarefa' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await resolveId(context);
  if (!id) return NextResponse.json({ erro: 'ID não fornecido' }, { status: 400 });

  try {
    const body = await request.json();
    const { tarefa_id, status } = body;

    if (!tarefa_id || !status) {
      return NextResponse.json({ erro: 'tarefa_id e status são obrigatórios' }, { status: 400 });
    }

    const antes = await query('SELECT * FROM TAB_LEAD_TAREFA WHERE id = $1', [tarefa_id]);
    if (antes.length === 0) {
      return NextResponse.json({ erro: 'Tarefa não encontrada' }, { status: 404 });
    }

    const result = await query(
      `UPDATE TAB_LEAD_TAREFA SET status = $1 WHERE id = $2 AND lead_id = $3 RETURNING *`,
      [status, tarefa_id, id]
    );

    const { usuario } = getClientInfo(request);
    await registrarAuditoria({
      usuario,
      acao: 'UPDATE',
      tabela: 'TAB_LEAD_TAREFA',
      registroId: tarefa_id,
      dadosAntes: antes[0],
      dadosDepois: result[0],
    });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[TAREFAS PATCH]', error);
    return NextResponse.json({ erro: 'Erro ao atualizar tarefa' }, { status: 500 });
  }
}
