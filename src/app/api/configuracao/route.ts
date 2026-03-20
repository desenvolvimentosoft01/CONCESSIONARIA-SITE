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
    const { chave, valor, descricao, categoria, tipo } = await request.json();

    // Busca valor anterior
    const anterior = await query('SELECT * FROM TAB_CONFIGURACAO WHERE chave = $1', [chave]);

    let result;
    let acao = 'UPDATE';

    if (anterior.length > 0) {
      // Se já existe, ATUALIZA
      result = await query(
        `UPDATE TAB_CONFIGURACAO 
         SET valor = $1, data_atualizacao = CURRENT_TIMESTAMP 
         WHERE chave = $2 
         RETURNING *`,
        [valor, chave]
      );
    } else {
      // Se não existe, CRIA (INSERT)
      acao = 'INSERT';
      const desc = descricao || chave;
      const cat = categoria || 'Geral';
      const tip = tipo || 'text';

      result = await query(
        `INSERT INTO TAB_CONFIGURACAO (chave, valor, descricao, categoria, tipo, data_atualizacao) 
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [chave, valor, desc, cat, tip]
      );
    }

    // Registra auditoria
    const clientInfo = getClientInfo(request);
    await registrarAuditoria({
      usuario: clientInfo.usuario,
      acao: acao,
      tabela: 'TAB_CONFIGURACAO',
      dadosAntes: anterior[0] || null,
      dadosDepois: result[0]
    });

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return NextResponse.json({ erro: 'Erro ao atualizar configuração' }, { status: 500 });
  }
}
