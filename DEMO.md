# Guia de Demonstração — Concessionaria Site

Como criar e gerenciar um ambiente de demonstração para clientes.

---

## Como funciona

O sistema de demo é uma **cópia separada do site** rodando no Vercel com um banco de dados próprio. O código é o mesmo da produção — o que muda são as variáveis de ambiente.

- O cliente acessa o site normalmente e usa todas as funcionalidades
- Um banner aparece no topo indicando que é um ambiente de demonstração
- O contador começa automaticamente na primeira visita e dura **7 dias**
- Após 7 dias, uma tela de encerramento bloqueia o acesso com seus dados de contato

---

## Passo a passo para criar uma demo

### 1. Criar o banco de dados (Neon)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita
2. Crie um novo projeto (ex: `concessionaria-demo`)
3. Copie a **Connection String** (DATABASE_URL)
4. Abra o SQL Editor no Neon e cole o conteúdo do arquivo `schema.sql` da raiz do projeto
5. Execute — todas as tabelas serão criadas com as etapas do CRM e um usuário admin padrão

**Usuário criado pelo script:**
```
Email: admin@demo.com
Senha: demo1234
```
Troque a senha após configurar, se quiser.

---

### 2. Criar o projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
2. Selecione o **mesmo repositório GitHub** do site principal
3. Dê um nome ao projeto (ex: `concessionaria-site-demo`)
4. Clique em **Deploy** (vai falhar por falta de env vars — isso é normal)

---

### 3. Configurar as variáveis de ambiente

No projeto demo no Vercel, vá em **Settings → Environment Variables** e adicione:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do banco Neon criado no passo 1 |
| `NEXT_PUBLIC_DEMO_MODE` | `true` |
| `NEXT_PUBLIC_DEMO_AGENCIA_WHATSAPP` | Seu WhatsApp (ex: `5518999999999`) |
| `NEXT_PUBLIC_DEMO_AGENCIA_EMAIL` | Seu e-mail de contato |
| `EMAIL_USER` | Gmail que envia os e-mails |
| `EMAIL_PASS` | Senha de app do Gmail |
| `CONTACT_RECIPIENT_EMAIL` | E-mail que recebe os contatos do formulário |
| `WHATSAPP_NUMERO_DONO` | WhatsApp que recebe notificações de leads |
| `EVOLUTION_API_URL` | URL da Evolution API |
| `EVOLUTION_API_KEY` | Chave da Evolution API |
| `EVOLUTION_INSTANCE` | Nome da instância WhatsApp |
| `CLOUDINARY_CLOUD_NAME` | Pode usar o mesmo da produção |
| `CLOUDINARY_API_KEY` | Pode usar o mesmo da produção |
| `CLOUDINARY_API_SECRET` | Pode usar o mesmo da produção |
| `NEXT_PUBLIC_SITE_URL` | URL da demo no Vercel |

> **Dica:** Para `CONTACT_RECIPIENT_EMAIL` e `WHATSAPP_NUMERO_DONO`, use seu próprio e-mail e WhatsApp. Assim você recebe as notificações durante a demo e pode mostrar pro cliente que funciona de verdade.

---

### 4. Fazer o redeploy

Após salvar as env vars, vá em **Deployments** e clique em **Redeploy** no último deploy.

Pronto — a demo está no ar.

---

## O que o cliente vê

**Durante os 7 dias:**
- Site completo funcionando normalmente
- Banner dourado no topo: `⚠ MODO DEMO | X dias restantes — expira em DD/MM/AAAA`
- No site público: barra discreta no rodapé com o mesmo aviso

**Após 7 dias:**
- Tela preta cobre tudo (admin e site público)
- Mensagem: "Demonstração Encerrada"
- Botões de WhatsApp e e-mail com seus dados de contato

---

## Convertendo demo em produção

Quando o cliente fechar negócio, a demo vira produção em minutos:

1. No Vercel do projeto demo, vá em **Settings → Environment Variables**
2. **Remova** `NEXT_PUBLIC_DEMO_MODE`
3. **Atualize** as variáveis com os dados reais do cliente:
   - `DATABASE_URL` → banco de produção do cliente
   - `EMAIL_USER` / `EMAIL_PASS` → e-mail do cliente
   - `CONTACT_RECIPIENT_EMAIL` → e-mail do cliente
   - `WHATSAPP_NUMERO_DONO` → WhatsApp do cliente
   - `EVOLUTION_*` → instância do cliente
4. Vá em **Deployments → Redeploy**

O banner some, o bloqueio some, o site vira produção real — sem nenhuma mudança no código.

---

## Resetar o contador da demo

Se precisar reiniciar os 7 dias (ex: o cliente pediu mais tempo):

No SQL Editor do Neon, execute:

```sql
DELETE FROM TAB_CONFIGURACAO WHERE chave = 'demo_inicio';
```

Na próxima visita ao site, o contador reinicia automaticamente.

---

## Resumo das env vars exclusivas da demo

```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_AGENCIA_WHATSAPP=5518999999999
NEXT_PUBLIC_DEMO_AGENCIA_EMAIL=seu@email.com
```

Essas três variáveis controlam tudo. Na produção elas não existem.
