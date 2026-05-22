import axios from 'axios';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.instagram.com/v18.0';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
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
    if (!WHATSAPP_PHONE_ID || !WHATSAPP_ACCESS_TOKEN || !WHATSAPP_NUMERO_DONO) {
      console.warn('[WhatsApp] Credenciais não configuradas — notificação será ignorada');
      return;
    }

    const mensagem = gerarMensagemLead(dados);

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: WHATSAPP_NUMERO_DONO,
        type: 'text',
        text: { body: mensagem },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[WhatsApp] Notificação enviada com sucesso:', response.data?.messages?.[0]?.id);
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar notificação:', error);
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
