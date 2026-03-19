import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  console.log('🔵 [API] =========== INÍCIO ===========');
  
  try {
    const body = await request.json();
    console.log('📦 [API] Body recebido:', body);

    const { nome, email, telefone, assunto, mensagem } = body;

    if (!nome || !email || !telefone || !assunto || !mensagem) {
      return NextResponse.json(
        { sucesso: false, erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { sucesso: false, erro: 'Erro de configuração do servidor' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Template bonito em HTML para o email que a loja recebe do cliente
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
          }
          
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 4px solid #ff6b00;
          }
          
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            letter-spacing: 1px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            color: #ff6b00;
            font-weight: bold;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .section-title {
            color: #1a1a1a;
            font-size: 20px;
            margin-bottom: 25px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ff6b00;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .info-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            border-left: 4px solid #ff6b00;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 20px;
            align-items: flex-start;
          }
          
          .info-icon {
            font-size: 24px;
            margin-right: 15px;
            min-width: 40px;
            text-align: center;
          }
          
          .info-content {
            flex: 1;
          }
          
          .info-label {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 18px;
            color: #1a1a1a;
            font-weight: 600;
            word-break: break-word;
          }
          
          .message-box {
            background: #fff3e0;
            border-radius: 12px;
            padding: 25px;
            margin-top: 25px;
            border: 1px solid #ffe0b2;
          }
          
          .message-box h3 {
            color: #ff6b00;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
          }
          
          .message-box h3:before {
            content: "💬";
            margin-right: 10px;
            font-size: 20px;
          }
          
          .message-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            color: #333;
            font-size: 16px;
            line-height: 1.8;
            border: 1px solid #ffe0b2;
          }
          
          .footer {
            background: #1a1a1a;
            color: white;
            padding: 30px;
            text-align: center;
            border-top: 4px solid #ff6b00;
          }
          
          .footer p {
            margin: 5px 0;
            color: #ccc;
          }
          
          .footer .phone {
            color: #ff6b00;
            font-size: 20px;
            font-weight: bold;
            margin: 10px 0;
          }
          
          .badge {
            display: inline-block;
            background: #ff6b00;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 15px;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
            }
            .content {
              padding: 20px;
            }
            .header h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 LUCAS VEÍCULOS</h1>
            <p>Nova mensagem de contato</p>
          </div>
          
          <div class="content">
            <h2 class="section-title">📋 Dados do Cliente</h2>
            
            <div class="info-card">
              <div class="info-row">
                <div class="info-icon">👤</div>
                <div class="info-content">
                  <div class="info-label">Nome completo</div>
                  <div class="info-value">${nome}</div>
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-icon">📧</div>
                <div class="info-content">
                  <div class="info-label">E-mail</div>
                  <div class="info-value">${email}</div>
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-icon">📞</div>
                <div class="info-content">
                  <div class="info-label">Telefone</div>
                  <div class="info-value">${telefone}</div>
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-icon">📝</div>
                <div class="info-content">
                  <div class="info-label">Assunto</div>
                  <div class="info-value">${assunto}</div>
                </div>
              </div>
            </div>
            
            <div class="message-box">
              <h3>Mensagem do Cliente</h3>
              <div class="message-content">
                ${mensagem}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <span class="badge">🔔 Responda em até 24h</span>
            </div>
          </div>
          
          <div class="footer">
            <p>LUCAS VEÍCULOS - Há 10 anos realizando sonhos</p>
            <p class="phone">📞 (18) 99669-2266</p>
            <p>📍 Araçatuba/SP</p>
            <p style="font-size: 12px; margin-top: 15px;">© 2026 - Todos os direitos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'lucasazzi270@gmail.com',
      replyTo: email,
      subject: `📬 Novo contato: ${assunto} - ${nome}`,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ [API] Email enviado com sucesso');

    return NextResponse.json({ 
      sucesso: true, 
      mensagem: 'Email enviado com sucesso!' 
    });

  } catch (error) {
    console.error('❌ [API] Erro:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao enviar email' },
      { status: 500 }
    );
  } finally {
    console.log('🔵 [API] =========== FIM ===========');
  }
}