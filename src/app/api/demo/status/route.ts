import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ demo: false });
  }

  const token = req.nextUrl.searchParams.get('token');

  // ── Modo por token (por cliente) ──────────────────────────────────────
  if (token) {
    try {
      const rows = await query(
        `SELECT id, cliente, expiracao, ativo FROM TAB_DEMO_TOKEN WHERE token = $1`,
        [token]
      );

      if (rows.length === 0) {
        return NextResponse.json({ demo: true, expirado: true, diasRestantes: 0, invalido: true });
      }

      const row = rows[0];
      const agora = new Date();
      const expiracao = new Date(row.expiracao);
      const expirado = !row.ativo || agora >= expiracao;
      const diasRestantes = expirado
        ? 0
        : Math.ceil((expiracao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));

      return NextResponse.json({
        demo: true,
        expirado,
        diasRestantes,
        dataExpiracao: expiracao.toLocaleDateString('pt-BR'),
        cliente: row.cliente,
      });
    } catch {
      return NextResponse.json({ demo: true, expirado: false, diasRestantes: 7, dataExpiracao: null });
    }
  }

  // ── Modo global (legado — sem token) ─────────────────────────────────
  try {
    const rows = await query(
      "SELECT valor FROM TAB_CONFIGURACAO WHERE chave = 'demo_inicio'"
    );

    let dataInicio: Date;
    if (rows.length === 0) {
      dataInicio = new Date();
      await query(
        `INSERT INTO TAB_CONFIGURACAO (chave, valor, descricao, categoria, tipo)
         VALUES ('demo_inicio', $1, 'Data de início do ambiente demo', 'demo', 'text')
         ON CONFLICT (chave) DO NOTHING`,
        [dataInicio.toISOString()]
      );
    } else {
      dataInicio = new Date(rows[0].valor);
    }

    const diasPassados = Math.floor((Date.now() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    const diasRestantes = Math.max(0, 7 - diasPassados);
    const dataExpiracao = new Date(dataInicio.getTime() + 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      demo: true,
      diasRestantes,
      expirado: diasRestantes === 0,
      dataExpiracao: dataExpiracao.toLocaleDateString('pt-BR'),
    });
  } catch {
    return NextResponse.json({ demo: true, diasRestantes: 7, expirado: false, dataExpiracao: null });
  }
}
