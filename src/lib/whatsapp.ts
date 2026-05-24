import axios from 'axios';

// Evolution API Configuration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'concessionaria';
const WHATSAPP_NUMERO_DONO = process.env.WHATSAPP_NUMERO_DONO;

interface DadosLead {
  nomeCliente: string;
  telefoneCliente: string;
  emailCliente?: string;
  veiculoInteresse?: string;
  origem: 'detalhes_carro' | 'contato' | 'financiamento' | 'interesse';
}

export async function enviarWhatsAppLead(dados: DadosLead): Promise<void> {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !WHATSAPP_NUMERO_DONO) {
      console.warn('[WhatsApp Evolution] Credenciais não configuradas — notificação será ignorada');
      return;
    }

    const mensagem = gerarMensagemLead(dados);

    const response = await axios.post(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        number: WHATSAPP_NUMERO_DONO,
        text: mensagem,
      },
      {
        headers: {
          apikey: EVOLUTION_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[WhatsApp Evolution] Notificação enviada com sucesso:', response.data?.message);
  } catch (error) {
    console.error('[WhatsApp Evolution] Erro ao enviar notificação:', error);
  }
}

function gerarMensagemLead(dados: DadosLead): string {
  const linkCRM = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://seu-site.com'}/admin/crm/leads`;

  let mensagem = `🚗 *NOVO LEAD IDENTIFICADO*\n\n`;
  mensagem += `*Cliente:* ${dados.nomeCliente}\n`;
  mensagem += `*Telefone:* ${dados.telefoneCliente}\n`;

  if (dados.emailCliente) {
    mensagem += `*Email:* ${dados.emailCliente}\n`;
  }

  if (dados.veiculoInteresse) {
    mensagem += `*Veículo:* ${dados.veiculoInteresse}\n`;
  }

  mensagem += `*Origem:* ${traduzOrigemLead(dados.origem)}\n\n`;
  mensagem += `📱 *Acessar CRM:* ${linkCRM}\n`;
  mensagem += `\nAcesse rápido pelo celular para não perder o lead!`;

  return mensagem;
}

function traduzOrigemLead(origem: string): string {
  const mapa: Record<string, string> = {
    detalhes_carro: 'Clique em Detalhes do Veículo',
    contato: 'Formulário de Contato',
    financiamento: 'Simulador de Financiamento',
    interesse: 'Botão Tenho Interesse',
  };
  return mapa[origem] || origem;
}
