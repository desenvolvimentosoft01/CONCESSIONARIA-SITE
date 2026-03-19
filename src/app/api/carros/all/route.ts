import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const carros = await query('SELECT * FROM TAB_CARRO ORDER BY id DESC');
    return NextResponse.json(carros);
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao buscar carros' }, { status: 500 });
  }
}
