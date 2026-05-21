# 📋 Documentação - Lucas Veículos

Bem-vindo à documentação do projeto da concessionária **Lucas Veículos** (Araçatuba/SP).

## 📚 Índice de Documentos

1. **[01-Arquitetura.md](01-Arquitetura.md)** — Stack técnico e estrutura do projeto
2. **[02-Banco-de-Dados.md](02-Banco-de-Dados.md)** — Schema, tabelas e convenções
3. **[03-Autenticacao.md](03-Autenticacao.md)** — Sistema de login e sessão
4. **[04-Rotas.md](04-Rotas.md)** — Rotas públicas e admin
5. **[05-API.md](05-API.md)** — Endpoints e handlers
6. **[06-Configuracao.md](06-Configuracao.md)** — Setup, variáveis de ambiente, tema
7. **[07-Cloudinary.md](07-Cloudinary.md)** — Gerenciamento de imagens

## ⚡ Início Rápido

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 🔧 Setup Inicial

1. Configure `.env.local` com credenciais (ver [06-Configuracao.md](06-Configuracao.md))
2. Prepare o banco PostgreSQL
3. Crie usuários admin via SQL

## 📂 Estrutura do Projeto

```
src/
  ├── app/                    # Next.js App Router
  │   ├── api/               # Route handlers
  │   ├── admin/             # Painel administrativo
  │   └── (public)/          # Rotas públicas
  ├── lib/                   # Utilitários
  │   ├── db.ts             # Conexão PostgreSQL
  │   ├── cloudinary.ts      # Config Cloudinary
  │   └── auditoria.ts       # Sistema de auditoria
  ├── components/            # Componentes React
  └── app/globals.css        # Estilos globais
```

## 🚀 Deploy

Quando estiver pronto para fazer deploy:

```
deploy
```

Este comando ativa o agente que:
1. Detecta mudanças pendentes
2. Agrupa por tipo (feat, fix, refactor, docs, etc)
3. Propõe commits em português
4. Pede aprovação
5. Faz git push

## 🆘 Suporte

Consulte a documentação específica conforme necessário. Cada arquivo tem detalhes técnicos da sua área.
