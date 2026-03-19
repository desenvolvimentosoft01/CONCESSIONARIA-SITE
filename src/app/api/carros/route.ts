import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

// GET - Listar todos os carros com a primeira imagem
export async function GET() {
  try {
    const carros = await query(`
      SELECT c.*, 
             (SELECT imagem_url FROM TAB_CARRO_IMAGEM 
              WHERE carro_id = c.id 
              ORDER BY ordem LIMIT 1) as primeira_imagem
      FROM TAB_CARRO c
      ORDER BY c.id DESC
    `);
    
    return NextResponse.json(carros);
  } catch (error) {
    console.error('Erro ao buscar carros:', error);
    return NextResponse.json({ erro: 'Erro ao buscar carros' }, { status: 500 });
  }
}

// POST - Criar novo carro
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const result = await query(
      `INSERT INTO TAB_CARRO (marca, modelo, ano, cor, placa, preco, imagem_url, descricao, disponivel)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.marca,
        data.modelo,
        data.ano,
        data.cor,
        data.placa || null,
        data.preco,
        data.imagem_url || null,
        data.descricao,
        data.disponivel
      ]
    );
    
    const carro = result[0];

    if (data.imagem_url) {
      await query(
        `INSERT INTO TAB_CARRO_IMAGEM (carro_id, imagem_url, ordem, tipo)
         VALUES ($1, $2, 0, 'imagem')`,
        [carro.id, data.imagem_url]
      );
    }
    
    // Registra auditoria
    const clientInfo = getClientInfo(request);
    await registrarAuditoria({
      usuario: clientInfo.usuario,
      acao: 'CREATE',
      tabela: 'TAB_CARRO',
      registroId: carro.id,
      dadosDepois: carro
    });
    
    return NextResponse.json(carro);
  } catch (error) {
    console.error('Erro ao criar carro:', error);
    return NextResponse.json({ erro: 'Erro ao criar carro' }, { status: 500 });
  }
}