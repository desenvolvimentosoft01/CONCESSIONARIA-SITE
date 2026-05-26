import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';
import { enviarWhatsAppLead } from '@/lib/whatsapp';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { marca, modelo, ano } = await request.json();

    const mensagem = `Clicou no botão WhatsApp na página do carro ${marca} ${modelo}`;
    const veiculoInteresse = `${marca} ${modelo} ${ano}`;

    const result = await query(
      `INSERT INTO TAB_LEAD (nome, email, telefone, mensagem, origem, etapa_id, carro_id)
       VALUES ($1, $2, $3, $4, $5, 1, $6)
       RETURNING *`,
      ['Visitante WhatsApp', '', 'Desconhecido', mensagem, 'interesse', id]
    );

    const lead = result[0];

    await registrarAuditoria({
      usuario: 'Sistema',
      acao: 'CREATE',
      tabela: 'TAB_LEAD',
      registroId: lead.id,
      dadosDepois: lead,
    });

    await enviarWhatsAppLead({
      nomeCliente: 'Visitante WhatsApp',
      telefoneCliente: 'Desconhecido',
      veiculoInteresse,
      origem: 'interesse',
    });

    return NextResponse.json({ sucesso: true });
  } catch (error: any) {
    console.error('[INTERESSE] Erro:', error?.message || error);
    return NextResponse.json({ sucesso: false }, { status: 500 });
  }
}
