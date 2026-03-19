import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const usuario = searchParams.get('usuario');
    const tabela = searchParams.get('tabela');
    const acao = searchParams.get('acao');

    let sql = 'SELECT * FROM TAB_AUDITORIA WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (usuario) {
      sql += ` AND usuario ILIKE $${paramIndex}`;
      params.push(`%${usuario}%`);
      paramIndex++;
    }

    if (tabela) {
      sql += ` AND tabela = $${paramIndex}`;
      params.push(tabela);
      paramIndex++;
    }

    if (acao) {
      sql += ` AND acao = $${paramIndex}`;
      params.push(acao);
      paramIndex++;
    }

    sql += ` ORDER BY data_hora DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limite, offset);

    const logs = await query(sql, params);

    // Conta total de registros
    const totalResult = await query('SELECT COUNT(*) as total FROM TAB_AUDITORIA');
    const total = parseInt(totalResult[0].total);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Erro ao buscar auditoria:', error);
    return NextResponse.json({ erro: 'Erro ao buscar logs' }, { status: 500 });
  }
}
