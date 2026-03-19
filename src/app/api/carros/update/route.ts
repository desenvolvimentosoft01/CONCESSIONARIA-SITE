import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Busca dados antes da alteração
    const dadosAntes = await query('SELECT * FROM TAB_CARRO WHERE id = $1', [data.id]);
    
    const result = await query(
      `UPDATE TAB_CARRO 
       SET marca = $1, modelo = $2, ano = $3, cor = $4, placa = $5, preco = $6, 
           imagem_url = $7, descricao = $8, disponivel = $9
       WHERE id = $10
       RETURNING *`,
      [
        data.marca, 
        data.modelo, 
        data.ano,
        data.cor,
        data.placa || null,
        data.preco, 
        data.imagem_url || null, 
        data.descricao || '', 
        data.disponivel, 
        data.id
      ]
    );
    
    const carro = result[0];
    
    // Registra auditoria
    const clientInfo = getClientInfo(request);
    await registrarAuditoria({
      usuario: clientInfo.usuario,
      acao: 'UPDATE',
      tabela: 'TAB_CARRO',
      registroId: carro.id,
      dadosAntes: dadosAntes[0],
      dadosDepois: carro
    });
    
    return NextResponse.json({ 
      sucesso: true, 
      carro
    });
    
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { erro: 'Erro ao atualizar carro' },
      { status: 500 }
    );
  }
}