import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { nome, cor } = await request.json();

    if (!nome?.trim()) {
      return NextResponse.json({ erro: 'Nome obrigatório' }, { status: 400 });
    }

    const antes = await query('SELECT * FROM TAB_LEAD_ETAPA WHERE id = $1', [id]);
    if (antes.length === 0) {
      return NextResponse.json({ erro: 'Etapa não encontrada' }, { status: 404 });
    }

    const result = await query(
      'UPDATE TAB_LEAD_ETAPA SET nome = $1, cor = $2 WHERE id = $3 RETURNING *',
      [nome.trim(), cor, id]
    );

    const { usuario } = getClientInfo(request);
    await registrarAuditoria({
      usuario,
      acao: 'UPDATE',
      tabela: 'TAB_LEAD_ETAPA',
      registroId: parseInt(id),
      dadosAntes: antes[0],
      dadosDepois: result[0],
    });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[ETAPAS PUT]', error);
    return NextResponse.json({ erro: 'Erro ao atualizar etapa' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const vinculados = await query('SELECT COUNT(*) AS total FROM TAB_LEAD WHERE etapa_id = $1', [id]);
    const total = parseInt(vinculados[0].total);
    if (total > 0) {
      return NextResponse.json(
        { erro: `Esta etapa possui ${total} lead(s) vinculado(s). Mova-os para outra etapa antes de excluir.` },
        { status: 409 }
      );
    }

    const antes = await query('SELECT * FROM TAB_LEAD_ETAPA WHERE id = $1', [id]);
    if (antes.length === 0) {
      return NextResponse.json({ erro: 'Etapa não encontrada' }, { status: 404 });
    }

    await query('DELETE FROM TAB_LEAD_ETAPA WHERE id = $1', [id]);

    const { usuario } = getClientInfo(request);
    await registrarAuditoria({
      usuario,
      acao: 'DELETE',
      tabela: 'TAB_LEAD_ETAPA',
      registroId: parseInt(id),
      dadosAntes: antes[0],
      dadosDepois: null,
    });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error('[ETAPAS DELETE]', error);
    return NextResponse.json({ erro: 'Erro ao excluir etapa' }, { status: 500 });
  }
}
