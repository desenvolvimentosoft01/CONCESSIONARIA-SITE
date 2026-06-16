# Como Configurar o Envio de Email

## Problema Identificado
Os emails não estão sendo enviados do formulário de contato e financiamento.

## Solução: Configurar variáveis de ambiente na Vercel

### Passo 1: Criar senha de aplicativo no Gmail

1. Acesse sua conta Google: https://myaccount.google.com/
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (se ainda não estiver ativa)
4. Procure por **Senhas de app**
5. Crie uma nova senha de app para "Outro (Nome personalizado)"
6. Nomeie como "Site Concessionária"
7. Copie a senha gerada (16 caracteres sem espaços)

### Passo 2: Configurar variáveis na Vercel

1. Acesse: https://vercel.com/
2. Entre no projeto **concessionaria-site**
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

```
EMAIL_USER = seu-email@gmail.com
EMAIL_PASS = senha-de-16-caracteres-copiada
CONTACT_RECIPIENT_EMAIL = email-que-vai-receber-os-contatos@gmail.com
```

### Passo 3: Fazer redeploy

Após configurar as variáveis:
1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**
4. Ou simplesmente faça um novo push no Git

## Testando

Após o redeploy:
1. Acesse o site em produção
2. Preencha o formulário de contato
3. Verifique se o email chegou em `CONTACT_RECIPIENT_EMAIL`
4. Verifique os logs da Vercel para ver se há erros

## Logs para verificar

Na Vercel, em **Deployments** > **Functions**, você verá logs como:

```
[CONTACT API] Configurações de email: { hasTransporter: true, emailUser: 'Configurado', ... }
[CONTACT API] Email enviado com sucesso para: email@gmail.com
```

Se aparecer `hasTransporter: false`, significa que as variáveis não estão configuradas corretamente.

## Notificações WhatsApp

Além do email, o sistema também envia notificação WhatsApp via Evolution API.
Para configurar:

```
EVOLUTION_API_URL = sua-url-evolution-api
EVOLUTION_API_KEY = sua-chave-api
EVOLUTION_INSTANCE = concessionaria
WHATSAPP_NUMERO_DONO = 5518999999999
```

A notificação WhatsApp agora inclui:
- Nome do cliente
- Telefone
- Email
- **Mensagem completa enviada pelo cliente**
- Link direto para o CRM

## Suporte

Se o problema persistir, verifique:
1. Se a senha de app está correta (sem espaços)
2. Se a verificação em 2 etapas está ativa no Gmail
3. Se o email remetente (EMAIL_USER) é válido
4. Logs da Vercel para mensagens de erro específicas
