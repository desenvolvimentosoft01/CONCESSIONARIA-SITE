import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

export async function GET() {
  try {
    const midias = await query('SELECT * FROM TAB_MIDIA ORDER BY secao, ordem');
    return NextResponse.json(midias);
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao buscar mídias' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { titulo, tipo, url, secao } = await request.json();

    const maxOrdem = await query(
      "SELECT COALESCE(MAX(ordem), -1) as max FROM TAB_MIDIA WHERE secao = $1",
      [secao]
    );

    const result = await query(
      `INSERT INTO TAB_MIDIA (titulo, tipo, url, secao, ordem, ativo)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [titulo, tipo, url, secao, maxOrdem[0].max + 1]
    );

    const midia = result[0];
    
    // Registra auditoria
    const clientInfo = getClientInfo(request);
    await registrarAuditoria({
      usuario: clientInfo.usuario,
      acao: 'CREATE',
      tabela: 'TAB_MIDIA',
      registroId: midia.id,
      dadosDepois: midia
    });

    return NextResponse.json(midia);
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao salvar mídia' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    // Busca dados antes de deletar
    const dadosAntes = await query('SELECT * FROM TAB_MIDIA WHERE id = $1', [id]);
    
    await query('DELETE FROM TAB_MIDIA WHERE id = $1', [id]);
    
    // Registra auditoria
    if (dadosAntes.length > 0) {
      const clientInfo = getClientInfo(request);
      await registrarAuditoria({
        usuario: clientInfo.usuario,
        acao: 'DELETE',
        tabela: 'TAB_MIDIA',
        registroId: id,
        dadosAntes: dadosAntes[0]
      });
    }
    
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao remover mídia' }, { status: 500 });
  }
}
