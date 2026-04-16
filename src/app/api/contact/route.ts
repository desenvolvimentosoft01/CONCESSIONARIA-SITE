import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const DADOS_LOJA = {
  nome: 'LUCAS VEÍCULOS',
  slogan: 'Há 10 anos realizando sonhos',
  telefone: '(18) 99669-2266',
  whatsapp: '(18) 99669-2266',
  email: 'contato@lucas.com',
  endereco: 'Av. Teste, 1000 — Centro, Araçatuba/SP',
  horario: 'Seg a Sex: 9h às 18h | Sábado: 9h às 12h',
};

// Singleton: reutiliza conexão entre requisições
const transporter =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      })
    : null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatarDataHora(date: Date): string {
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function obterIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'Não disponível';
}

function buildTemplate(params: {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
  dataHora: string;
  ip: string;
}): string {
  const { nome, email, telefone, assunto, mensagem, dataHora, ip } = params;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Novo Contato — ${DADOS_LOJA.nome}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px 30px;text-align:center;border-bottom:4px solid #c5a059;">
              <h1 style="color:#ffffff;margin:0 0 6px 0;font-size:26px;font-weight:900;letter-spacing:2px;">${DADOS_LOJA.nome}</h1>
              <p style="color:#c5a059;margin:0;font-size:13px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">${DADOS_LOJA.slogan}</p>
              <div style="display:inline-block;margin-top:18px;background-color:#c5a059;color:#ffffff;padding:6px 20px;border-radius:20px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                📬 Nova Mensagem de Contato
              </div>
            </td>
          </tr>

          <!-- ASSUNTO DESTAQUE -->
          <tr>
            <td style="padding:28px 30px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8ee;border-left:4px solid #c5a059;border-radius:4px;padding:16px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Assunto</p>
                    <p style="margin:0;font-size:20px;font-weight:800;color:#1a1a1a;">${escapeHtml(assunto)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DADOS DO CLIENTE -->
          <tr>
            <td style="padding:24px 30px 0;">
              <p style="margin:0 0 16px 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;font-weight:700;border-bottom:1px solid #eee;padding-bottom:10px;">
                📋 Dados do Cliente
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">
                    <span style="font-size:12px;color:#888;display:block;margin-bottom:2px;">👤 Nome completo</span>
                    <span style="font-size:16px;color:#1a1a1a;font-weight:600;">${escapeHtml(nome)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">
                    <span style="font-size:12px;color:#888;display:block;margin-bottom:2px;">📧 E-mail</span>
                    <a href="mailto:${escapeHtml(email)}" style="font-size:16px;color:#c5a059;font-weight:600;text-decoration:none;">${escapeHtml(email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">
                    <span style="font-size:12px;color:#888;display:block;margin-bottom:2px;">📞 Telefone / WhatsApp</span>
                    <span style="font-size:16px;color:#1a1a1a;font-weight:600;">${escapeHtml(telefone)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MENSAGEM -->
          <tr>
            <td style="padding:24px 30px 0;">
              <p style="margin:0 0 12px 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;font-weight:700;border-bottom:1px solid #eee;padding-bottom:10px;">
                💬 Mensagem
              </p>
              <div style="background-color:#f9f9f9;border-radius:8px;padding:20px;border:1px solid #eeeeee;">
                <p style="margin:0;font-size:15px;color:#333;line-height:1.8;white-space:pre-wrap;">${escapeHtml(mensagem)}</p>
              </div>
            </td>
          </tr>

          <!-- BOTÃO RESPONDER -->
          <tr>
            <td style="padding:28px 30px 0;text-align:center;">
              <a href="mailto:${escapeHtml(email)}?subject=Re: ${encodeURIComponent(assunto)}&body=Ol%C3%A1 ${encodeURIComponent(nome)},%0A%0A"
                 style="display:inline-block;background-color:#c5a059;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:4px;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                ↩ Responder ao Cliente
              </a>
            </td>
          </tr>

          <!-- METADADOS -->
          <tr>
            <td style="padding:24px 30px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-radius:6px;padding:14px 16px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px 0;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Informações técnicas</p>
                    <p style="margin:0;font-size:12px;color:#888;">🕐 Data/Hora: ${dataHora}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#888;">🌐 IP: ${escapeHtml(ip)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RODAPÉ DA LOJA -->
          <tr>
            <td style="padding:30px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-top:4px solid #c5a059;">
                <tr>
                  <td style="padding:30px;text-align:center;">
                    <p style="margin:0 0 4px 0;color:#ffffff;font-size:18px;font-weight:900;letter-spacing:1px;">${DADOS_LOJA.nome}</p>
                    <p style="margin:0 0 16px 0;color:#c5a059;font-size:12px;letter-spacing:2px;">${DADOS_LOJA.slogan}</p>
                    <p style="margin:0 0 4px 0;color:#cccccc;font-size:13px;">📍 ${DADOS_LOJA.endereco}</p>
                    <p style="margin:0 0 4px 0;color:#cccccc;font-size:13px;">📞 ${DADOS_LOJA.telefone} &nbsp;|&nbsp; 💬 WhatsApp: ${DADOS_LOJA.whatsapp}</p>
                    <p style="margin:0 0 4px 0;color:#cccccc;font-size:13px;">📧 ${DADOS_LOJA.email}</p>
                    <p style="margin:8px 0 0;color:#888888;font-size:12px;">🕐 ${DADOS_LOJA.horario}</p>
                    <p style="margin:20px 0 0;color:#555555;font-size:11px;">© ${new Date().getFullYear()} ${DADOS_LOJA.nome} — Desenvolvido por AzSistemas. Todos os direitos reservados.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, telefone, assunto, mensagem } = body;

    if (!nome || !email || !telefone || !assunto || !mensagem) {
      return NextResponse.json(
        { sucesso: false, erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!transporter) {
      return NextResponse.json(
        { sucesso: false, erro: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    const dataHora = formatarDataHora(new Date());
    const ip = obterIp(request);
    const destinatario = process.env.CONTACT_RECIPIENT_EMAIL ?? 'desenvolvimentoSoft01@gmail.com';

    await transporter.sendMail({
      from: `"${DADOS_LOJA.nome}" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      replyTo: email,
      subject: `📬 Novo contato: ${assunto} — ${nome}`,
      html: buildTemplate({ nome, email, telefone, assunto, mensagem, dataHora, ip }),
    });

    return NextResponse.json({ sucesso: true, mensagem: 'Email enviado com sucesso!' });
  } catch (error) {
    console.error('❌ [CONTACT API] Erro:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}
