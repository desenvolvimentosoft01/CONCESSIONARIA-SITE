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
      `SELECT l.*,
              e.nome  AS etapa_nome,
              e.cor   AS etapa_cor,
              c.modelo AS carro_modelo
       FROM TAB_LEAD l
       LEFT JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id
       LEFT JOIN TAB_CARRO c ON l.carro_id = c.id
       WHERE l.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ erro: 'Lead não encontrado' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('[LEAD GET]', error);
    return NextResponse.json({ erro: 'Erro ao buscar lead' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await resolveId(context);
  if (!id) return NextResponse.json({ erro: 'ID não fornecido' }, { status: 400 });

  try {
    const body = await request.json();
    const { etapa_id, responsavel_id, carro_id, valor_estimado, nome, email, telefone } = body;

    const antes = await query('SELECT * FROM TAB_LEAD WHERE id = $1', [id]);
    if (antes.length === 0) {
      return NextResponse.json({ erro: 'Lead não encontrado' }, { status: 404 });
    }

    const campos: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (etapa_id !== undefined) { campos.push(`etapa_id = $${idx++}`); params.push(etapa_id); }
    if (responsavel_id !== undefined) { campos.push(`responsavel_id = $${idx++}`); params.push(responsavel_id); }
    if (carro_id !== undefined) { campos.push(`carro_id = $${idx++}`); params.push(carro_id); }
    if (valor_estimado !== undefined) { campos.push(`valor_estimado = $${idx++}`); params.push(valor_estimado); }
    if (nome !== undefined) { campos.push(`nome = $${idx++}`); params.push(nome); }
    if (email !== undefined) { campos.push(`email = $${idx++}`); params.push(email); }
    if (telefone !== undefined) { campos.push(`telefone = $${idx++}`); params.push(telefone); }

    if (campos.length === 0) {
      return NextResponse.json({ erro: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    campos.push(`atualizado_em = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE TAB_LEAD SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    const { usuario } = getClientInfo(request);
    await registrarAuditoria({
      usuario,
      acao: 'UPDATE',
      tabela: 'TAB_LEAD',
      registroId: parseInt(id),
      dadosAntes: antes[0],
      dadosDepois: result[0],
    });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[LEAD PUT]', error);
    return NextResponse.json({ erro: 'Erro ao atualizar lead' }, { status: 500 });
  }
}
