import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

// GET - Listar imagens
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = 'params' in context ? context.params : undefined;
  const resolvedParams = params && 'then' in params ? await params : params;
  const id = resolvedParams?.id;

  console.log('🔵 GET /api/carros/' + id + '/imagens');
  
  try {
    const imagens = await query(
      'SELECT * FROM TAB_CARRO_IMAGEM WHERE carro_id = $1 ORDER BY ordem',
      [id]
    );
    
    console.log('✅ Imagens encontradas:', imagens.length);
    return NextResponse.json(imagens);
  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ erro: 'Erro ao buscar imagens' }, { status: 500 });
  }
}

// POST - Adicionar imagem
export async function POST(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = 'params' in context ? context.params : undefined;
  const resolvedParams = params && 'then' in params ? await params : params;
  const id = resolvedParams?.id;

  console.log('🔵 POST /api/carros/' + id + '/imagens');
  
  try {
    const { imagem_url, tipo = 'imagem' } = await request.json();
    console.log('📦 Mídia recebida:', imagem_url, 'Tipo:', tipo);

    if (!imagem_url) {
      return NextResponse.json({ erro: 'URL da mídia não fornecida' }, { status: 400 });
    }

    const maxOrdem = await query(
      'SELECT COALESCE(MAX(ordem), -1) as max FROM TAB_CARRO_IMAGEM WHERE carro_id = $1',
      [id]
    );
    
    const novaOrdem = maxOrdem[0].max + 1;
    
    const result = await query(
      `INSERT INTO TAB_CARRO_IMAGEM (carro_id, imagem_url, ordem, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, imagem_url, novaOrdem, tipo]
    );
    
    const imagem = result[0];
    console.log('✅ Mídia salva:', imagem);
    
    // Registra auditoria
    const clientInfo = getClientInfo(request);
    await registrarAuditoria({
      usuario: clientInfo.usuario,
      acao: 'CREATE',
      tabela: 'TAB_CARRO_IMAGEM',
      registroId: imagem.id,
      dadosDepois: imagem
    });
    
    return NextResponse.json(imagem);
  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ erro: 'Erro ao adicionar mídia' }, { status: 500 });
  }
}

// DELETE - Remover imagem
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = 'params' in context ? context.params : undefined;
  const resolvedParams = params && 'then' in params ? await params : params;
  const id = resolvedParams?.id;

  console.log('🔵 DELETE /api/carros/' + id + '/imagens');
  
  try {
    const { imagem_url } = await request.json();
    
    // Busca dados antes de deletar
    const dadosAntes = await query(
      'SELECT * FROM TAB_CARRO_IMAGEM WHERE carro_id = $1 AND imagem_url = $2',
      [id, imagem_url]
    );
    
    await query(
      'DELETE FROM TAB_CARRO_IMAGEM WHERE carro_id = $1 AND imagem_url = $2',
      [id, imagem_url]
    );
    
    console.log('✅ Imagem removida');
    
    // Registra auditoria
    if (dadosAntes.length > 0) {
      const clientInfo = getClientInfo(request);
      await registrarAuditoria({
        usuario: clientInfo.usuario,
        acao: 'DELETE',
        tabela: 'TAB_CARRO_IMAGEM',
        registroId: dadosAntes[0].id,
        dadosAntes: dadosAntes[0]
      });
    }
    
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ erro: 'Erro ao remover imagem' }, { status: 500 });
  }
}