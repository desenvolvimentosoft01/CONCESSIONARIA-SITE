import { query } from './db';
import { registrarAuditoria } from './auditoria';

interface DadosLead {
  nome: string;
  email: string;
  telefone?: string;
  mensagem?: string;
  origem: 'contato' | 'financiamento';
  carro_id?: number;
}

export async function criarLeadAutomatico(dados: DadosLead): Promise<void> {
  try {
    const result = await query(
      dados.carro_id
        ? `INSERT INTO TAB_LEAD (nome, email, telefone, mensagem, origem, etapa_id, carro_id)
           VALUES ($1, $2, $3, $4, $5, 1, $6)
           RETURNING *`
        : `INSERT INTO TAB_LEAD (nome, email, telefone, mensagem, origem, etapa_id)
           VALUES ($1, $2, $3, $4, $5, 1)
           RETURNING *`,
      dados.carro_id
        ? [dados.nome, dados.email, dados.telefone ?? null, dados.mensagem ?? null, dados.origem, dados.carro_id]
        : [dados.nome, dados.email, dados.telefone ?? null, dados.mensagem ?? null, dados.origem]
    );

    await registrarAuditoria({
      usuario: 'Sistema',
      acao: 'CREATE',
      tabela: 'TAB_LEAD',
      registroId: result[0].id,
      dadosDepois: result[0],
    });
  } catch (error) {
    console.error('[CRM] Erro ao criar lead automático:', error);
  }
}
