# Lucas Veículos — Site para Concessionária

Site completo para concessionária de veículos usados com painel administrativo, CRM e captura automática de leads.

## Funcionalidades

**Site público**
- Página inicial com banner e destaques do estoque
- Listagem de estoque com filtros por marca, modelo, preço e ano
- Página de detalhe do veículo com galeria de fotos/vídeos e botão WhatsApp
- Páginas de empresa, serviços, financiamento e contato
- Formulários de contato e financiamento com validação e envio de e-mail

**Painel Admin**
- CRUD completo de veículos com upload de imagens via Cloudinary
- Gerenciamento de mídia do site por seção (carrosséis, galeria, etc.)
- Personalização de cores e tema em tempo real
- Log de auditoria de todas as ações (CREATE / UPDATE / DELETE)

**CRM**
- Captura automática de leads via formulários públicos e botão WhatsApp
- Pipeline de vendas com etapas configuráveis (Novo → Ganho)
- Histórico de interações e tarefas por lead
- Alerta de leads esfriando (sem interação há 3+ dias)
- Ao mover lead para "Ganho": marca o veículo automaticamente como indisponível no estoque
- Notificação WhatsApp ao dono a cada novo lead (via Evolution API)

## Stack

- **Framework:** Next.js 14 (App Router, server components + client components)
- **Banco de dados:** PostgreSQL via `pg` (pool de conexões, queries diretas — sem ORM)
- **Imagens:** Cloudinary (upload, CDN, transformações)
- **E-mail:** Nodemailer + Gmail SMTP
- **WhatsApp:** Evolution API
- **Estilização:** CSS Modules com nomenclatura em português

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com os valores reais

# 3. Rodar o banco (PostgreSQL deve estar rodando)
# Executar as migrations em docs/historico/crm-migration.sql se necessário

# 4. Iniciar em desenvolvimento
npm run dev
# Acesse http://localhost:3000
# Admin em http://localhost:3000/entrar
```

## Variáveis de ambiente

Veja `.env.example` para a lista completa com comentários. As principais:

```
DATABASE_URL          # PostgreSQL connection string
CLOUDINARY_*          # Credenciais Cloudinary
EMAIL_USER / EMAIL_PASS  # Gmail para envio de e-mails
EVOLUTION_API_*       # Evolution API para notificações WhatsApp
WHATSAPP_NUMERO_DONO  # Número do dono que recebe os alertas
```

## Documentação técnica

Consulte `CLAUDE.md` para arquitetura detalhada, padrões de código e referência completa de rotas e tabelas.
