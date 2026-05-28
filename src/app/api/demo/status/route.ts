import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return NextResponse.json({ demo: false });
  }

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

    const diasPassados = Math.floor(
      (Date.now() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    const diasRestantes = Math.max(0, 7 - diasPassados);
    const dataExpiracao = new Date(dataInicio.getTime() + 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      demo: true,
      diasRestantes,
      expirado: diasRestantes === 0,
      dataExpiracao: dataExpiracao.toLocaleDateString('pt-BR'),
    });
  } catch {
    return NextResponse.json({
      demo: true,
      diasRestantes: 7,
      expirado: false,
      dataExpiracao: null,
    });
  }
}
