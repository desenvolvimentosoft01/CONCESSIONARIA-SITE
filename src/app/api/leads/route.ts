import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const etapa_id = searchParams.get('etapa_id');
    const origem = searchParams.get('origem');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = (page - 1) * limit;

    const condicoes: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (etapa_id) {
      condicoes.push(`l.etapa_id = $${idx++}`);
      params.push(parseInt(etapa_id));
    }
    if (origem) {
      condicoes.push(`l.origem = $${idx++}`);
      params.push(origem);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const [leads, total] = await Promise.all([
      query(
        `SELECT l.*,
                e.nome  AS etapa_nome,
                e.cor   AS etapa_cor,
                c.modelo AS carro_modelo
         FROM TAB_LEAD l
         LEFT JOIN TAB_LEAD_ETAPA e ON l.etapa_id = e.id
         LEFT JOIN TAB_CARRO c ON l.carro_id = c.id
         ${where}
         ORDER BY l.criado_em DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limit, offset]
      ),
      query(
        `SELECT COUNT(*) AS total FROM TAB_LEAD l ${where}`,
        params
      ),
    ]);

    const totalCount = parseInt(total[0].total);

    return NextResponse.json({
      leads,
      total: totalCount,
      paginas: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('[LEADS GET]', error);
    return NextResponse.json({ erro: 'Erro ao buscar leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, telefone, mensagem, origem, etapa_id, carro_id, valor_estimado } = body;

    if (!nome || !email) {
      return NextResponse.json({ erro: 'Nome e email são obrigatórios' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO TAB_LEAD (nome, email, telefone, mensagem, origem, etapa_id, carro_id, valor_estimado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nome,
        email,
        telefone ?? null,
        mensagem ?? null,
        origem ?? 'manual',
        etapa_id ?? 1,
        carro_id ?? null,
        valor_estimado ?? null,
      ]
    );

    const { usuario } = getClientInfo(request);
    await registrarAuditoria({
      usuario,
      acao: 'CREATE',
      tabela: 'TAB_LEAD',
      registroId: result[0].id,
      dadosDepois: result[0],
    });

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('[LEADS POST]', error);
    return NextResponse.json({ erro: 'Erro ao criar lead' }, { status: 500 });
  }
}
