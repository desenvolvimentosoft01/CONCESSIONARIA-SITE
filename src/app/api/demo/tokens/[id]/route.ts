import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PATCH /api/demo/tokens/[id] — estender, reativar ou desativar
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { acao, dias } = await req.json();
    // acao: 'estender' | 'reativar' | 'desativar'

    if (acao === 'estender') {
      // Estende a partir de agora se expirado, ou a partir da expiração atual
      const extraDias = dias ?? 1;
      await query(
        `UPDATE TAB_DEMO_TOKEN
         SET expiracao = GREATEST(expiracao, NOW()) + ($2 || ' days')::INTERVAL,
             ativo = true,
             atualizado_em = NOW()
         WHERE id = $1`,
        [params.id, extraDias]
      );
    } else if (acao === 'reativar') {
      // Reativa com N dias a partir de agora
      const extraDias = dias ?? 7;
      await query(
        `UPDATE TAB_DEMO_TOKEN
         SET expiracao = NOW() + ($2 || ' days')::INTERVAL,
             ativo = true,
             atualizado_em = NOW()
         WHERE id = $1`,
        [params.id, extraDias]
      );
    } else if (acao === 'desativar') {
      await query(
        `UPDATE TAB_DEMO_TOKEN SET ativo = false, atualizado_em = NOW() WHERE id = $1`,
        [params.id]
      );
    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    const rows = await query(
      `SELECT id, token, cliente, dias, expiracao, ativo FROM TAB_DEMO_TOKEN WHERE id = $1`,
      [params.id]
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar token' }, { status: 500 });
  }
}

// DELETE /api/demo/tokens/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query(`DELETE FROM TAB_DEMO_TOKEN WHERE id = $1`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar token' }, { status: 500 });
  }
}
