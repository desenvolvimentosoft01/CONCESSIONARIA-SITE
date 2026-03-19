import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = 'params' in context ? context.params : undefined;
  const resolvedParams = params && 'then' in params ? await params : params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ erro: 'ID do carro não fornecido' }, { status: 400 });
  }

  try {
    // Busca dados antes de deletar
    const dadosAntes = await query('SELECT * FROM TAB_CARRO WHERE id = $1', [id]);
    if (dadosAntes.length === 0) {
      return NextResponse.json({ erro: 'Carro não encontrado' }, { status: 404 });
    }

    // Exclui mídias relacionadas primeiro (se houver FK restrito)
    await query('DELETE FROM TAB_CARRO_IMAGEM WHERE carro_id = $1', [id]);

    await query('DELETE FROM TAB_CARRO WHERE id = $1', [id]);
    
    // Registra auditoria
    const clientInfo = getClientInfo(request);
    await registrarAuditoria({
      usuario: clientInfo.usuario,
      acao: 'DELETE',
      tabela: 'TAB_CARRO',
      registroId: parseInt(id),
      dadosAntes: dadosAntes[0]
    });
    
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao deletar carro:', error);
    return NextResponse.json({ erro: 'Erro ao deletar carro' }, { status: 500 });
  }
}