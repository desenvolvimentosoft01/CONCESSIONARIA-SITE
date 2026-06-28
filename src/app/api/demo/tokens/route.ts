import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// GET /api/demo/tokens — lista todos os tokens
export async function GET() {
  try {
    const rows = await query(
      `SELECT id, token, cliente, dias, inicio, expiracao, ativo, criado_em
       FROM TAB_DEMO_TOKEN
       ORDER BY criado_em DESC`
    );
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao listar tokens' }, { status: 500 });
  }
}

// POST /api/demo/tokens — cria novo token para um cliente
export async function POST(req: NextRequest) {
  try {
    const { cliente, dias = 7 } = await req.json();
    if (!cliente) return NextResponse.json({ error: 'Nome do cliente obrigatório' }, { status: 400 });

    const token = crypto.randomBytes(24).toString('hex');
    const inicio = new Date();
    const expiracao = new Date(inicio.getTime() + dias * 24 * 60 * 60 * 1000);

    const rows = await query(
      `INSERT INTO TAB_DEMO_TOKEN (token, cliente, dias, inicio, expiracao, ativo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, token, cliente, dias, expiracao`,
      [token, cliente, dias, inicio, expiracao]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar token' }, { status: 500 });
  }
}
