import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

export async function GET() {
  try {
    const configs = await query('SELECT * FROM TAB_CONFIGURACAO ORDER BY categoria, chave');
    return NextResponse.json(configs);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ erro: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { chave, valor } = await request.json();

    // Busca valor anterior
    const anterior = await query('SELECT * FROM TAB_CONFIGURACAO WHERE chave = $1', [chave]);

    const result = await query(
      `UPDATE TAB_CONFIGURACAO 
       SET valor = $1, data_atualizacao = CURRENT_TIMESTAMP 
       WHERE chave = $2 
       RETURNING *`,
      [valor, chave]
    );

    if (result.length === 0) {
      return NextResponse.json({ erro: 'Configuração não encontrada' }, { status: 404 });
    }

    // Registra auditoria
    const clientInfo = getClientInfo(request);
    await registrarAuditoria({
      usuario: clientInfo.usuario,
      acao: 'UPDATE',
      tabela: 'TAB_CONFIGURACAO',
      dadosAntes: anterior[0],
      dadosDepois: result[0]
    });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json({ erro: 'Erro ao atualizar configuração' }, { status: 500 });
  }
}
