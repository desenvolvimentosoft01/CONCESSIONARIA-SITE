# Documentacao - Lucas Veiculos

Bem-vindo a documentacao do projeto da concessionaria **Lucas Veiculos** (Aracatuba/SP).

## Indice de Documentos

1. **[01-Arquitetura.md](01-Arquitetura.md)** — Stack tecnico e estrutura do projeto
2. **[02-Banco-de-Dados.md](02-Banco-de-Dados.md)** — Schema, tabelas e convencoes
3. **[03-Autenticacao.md](03-Autenticacao.md)** — Sistema de login e sessao
4. **[04-Rotas.md](04-Rotas.md)** — Rotas publicas e admin
5. **[05-API.md](05-API.md)** — Endpoints e handlers
6. **[06-Configuracao.md](06-Configuracao.md)** — Setup, variaveis de ambiente, tema
7. **[07-Cloudinary.md](07-Cloudinary.md)** — Gerenciamento de imagens

## Inicio Rapido

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Setup Inicial

1. Configure `.env.local` com credenciais (ver [06-Configuracao.md](06-Configuracao.md))
2. Prepare o banco PostgreSQL e crie as tabelas com `node scripts/setup-db.mjs`
3. Crie usuarios admin via SQL

## Estrutura do Projeto

```
src/
  app/                    # Next.js App Router
    api/                  # Route handlers
      carros/             # CRUD de veiculos
      leads/              # CRM - leads, etapas, interacoes, tarefas
      midia/              # Gerenciamento de midia por secao
      configuracao/       # Configuracoes gerais
      auditoria/          # Log de auditoria
      contact/            # Formulario de contato (envia email + cria lead)
      financiamento-contato/ # Formulario de financiamento (cria lead)
      upload/             # Upload de imagens para Cloudinary
      login/              # Autenticacao
    admin/                # Painel administrativo
      dashboard/
      carros/
      crm/                # CRM (leads, funil, tarefas, relatorios, configuracoes)
      configuracoes/      # Cores, Midia, Textos, Auditoria
    (public)/             # Rotas publicas
  lib/                    # Utilitarios
    db.ts                 # Conexao PostgreSQL
    cloudinary.ts         # Config Cloudinary
    auditoria.ts          # Sistema de auditoria
    crm.ts                # Helper para criacao automatica de leads
    whatsapp.ts           # Notificacoes via Evolution API
  components/             # Componentes React
  app/globals.css         # Estilos globais
```

## Deploy

Quando estiver pronto para fazer deploy:

```
deploy
```

Este comando ativa o agente que:
1. Detecta mudancas pendentes
2. Agrupa por tipo (feat, fix, refactor, docs, etc)
3. Propoe commits em portugues
4. Pede aprovacao
5. Faz git push

## Suporte

Consulte a documentacao especifica conforme necessario. Cada arquivo tem detalhes tecnicos da sua area.
