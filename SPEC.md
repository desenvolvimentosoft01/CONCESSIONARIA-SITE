# 📋 SPEC.md — Lucas Veículos

**Versão**: 1.1  
**Data Atualização**: 2026-05-19  
**Status**: Em Desenvolvimento (MVP + Funcionalidades Adicionais)

---

## 1. Visão Geral

**Lucas Veículos** é um website moderno para uma concessionária de carros em Araçatuba/SP, focado em:
- **Site Público**: Catálogo de veículos, about, serviços, financiamento, contato
- **Painel Admin**: Gerenciamento completo de estoque, mídia, tema, auditoria e financiamento

**Tech Stack**: 
- Frontend: Next.js 14 (App Router) + React + TypeScript + CSS Modules
- Backend: Node.js (Next.js API Routes)
- Database: PostgreSQL (com pool via `pg`)
- Storage: Cloudinary (imagens/vídeos)
- Email: Gmail/Nodemailer

---

## 2. Requisitos Funcionais

### 2.1 Seção Pública

#### Home (`/`)
- [ ] Implementado
- Exibir banner principal com imagem de destaque
- Listar carros destaque (selecionados ou mais recentes)
- Chamada-para-ação (CTA) para estoque e contato
- Carrousels de mídia gerenciados em `TAB_MIDIA` (secao: carousel_home)

#### Estoque (`/estoque`)
- [ ] Implementado
- Listar todos os carros com `ativo = true`
- Filtros: marca, modelo, faixa de preço, ano
- Busca por texto
- Paginação
- Exibir card com imagem principal (primeira de `TAB_CARRO_IMAGEM` por ordem)

#### Detalhe do Carro (`/carro/[id]`)
- [ ] Implementado
- Galeria completa de imagens (todas de `TAB_CARRO_IMAGEM` em ordem)
- Informações técnicas: marca, modelo, ano, preço, descrição
- Opções de contato: formulário inline ou link para `/contato`
- Exibir carros relacionados (mesmo marca/modelo similar)

#### Empresa/About (`/empresa`)
- [ ] Implementado
- Informações sobre Lucas Veículos (história, missão, valores)
- Mídia gerenciada (`TAB_MIDIA` com secao: about_galeria)
- Dados de contato e mapa de localização

#### Serviços (`/servicos`)
- [ ] Implementado
- Listar serviços oferecidos (financiamento, troca, revisão, etc)
- Descrições e benefícios
- Call-to-action para contato

#### Financiamento (`/financiamento`)
- [x] Implementado
- Hero section: título, subtítulo, badge de destaque
- Diferenciais: 4 cards (aprovação, taxas, processo, integral)
- Formulário de solicitação: nome, email, telefone, valor_veiculo (opt), mensagem
- Enviar email para `EMAIL_USER` via `/api/financiamento-contato`
- Validação client + server
- Feedback de sucesso/erro
- Vantagens: lista com ícone check
- Como Funciona: 4 passos numerados
- Conteúdo gerenciado pelo admin via `TAB_CONFIGURACAO` (chaves JSON)

#### Contato (`/contato`)
- [ ] Implementado
- Formulário: nome, email, telefone, assunto, mensagem
- Enviar email para `EMAIL_USER` (Gmail) via Nodemailer
- Validação client-side + server-side
- Feedback de sucesso/erro ao usuário
- Mensagem de confirmação ao usuário

#### Login (`/entrar`)
- [ ] Implementado
- Formulário: email + senha
- Validação: email existe em `TAB_USUARIO` e `ativo = true`
- Comparação de senha em texto plano
- Ao sucesso:
  - Armazenar em `sessionStorage`: `admin_logado = true`, `admin_nome = <nome>`
  - Setar cookie `admin_usuario` com nome do usuário
  - Redirecionar para `/admin/dashboard`
- Logout: limpar `sessionStorage` e cookie

---

### 2.2 Seção Admin (Protegida por Autenticação)

#### Dashboard (`/admin/dashboard`)
- [ ] Implementado
- Menu/navegação para todas as funcionalidades
- Resumo: total de carros, últimas ações de auditoria
- Links diretos para: carros, mídia, personalizacao, auditoria

#### Gerenciar Carros (`/admin/carros`)
- [ ] Implementado
- Listar carros (todos, inclusive inativos)
- Colunas: foto, marca, modelo, ano, preço, ativo (toggle)
- Ações: editar, deletar, toggle ativo/inativo
- Deletar = `DELETE FROM TAB_CARRO` (em cascata com `TAB_CARRO_IMAGEM`)
- Registrar auditoria para cada ação

#### Adicionar Carro (`/admin/carros/novo`)
- [ ] Implementado
- Formulário: marca, modelo, ano, preço, descrição, ativo
- Upload múltiplo de imagens → Cloudinary
- Salvar em `TAB_CARRO` + `TAB_CARRO_IMAGEM` (com ordem)
- Registrar auditoria

#### Editar Carro (`/admin/carros/editar/[id]`)
- [ ] Implementado
- Formulário pré-preenchido com dados do carro
- Editar texto: marca, modelo, ano, preço, descrição, ativo
- Gerenciar imagens:
  - Adicionar novas (upload Cloudinary)
  - Deletar existentes
  - Reordenar (drag-and-drop ou input numérico)
- Registrar auditoria

#### Gerenciar Mídia (`/admin/midia`)
- [ ] Implementado
- Interface por seção (`carousel_home`, `about_galeria`, etc)
- Upload de imagens/vídeos → Cloudinary
- Listar mídia por seção
- Reordenar (ordem de exibição)
- Deletar
- Registrar auditoria

#### Personalização (`/admin/personalizacao`)
- [ ] Implementado
- Formulário com inputs de cor para:
  - `cor_primaria` (principal, botões, links)
  - `cor_header` (cabeçalho)
  - `cor_footer` (rodapé)
  - Outras cores conforme `TAB_CONFIGURACAO`
- Salvar em `TAB_CONFIGURACAO`
- Preview em tempo real (CSS variables injetadas)
- Registrar auditoria

#### Financiamento (`/admin/financiamento`)
- [x] Implementado
- Editar textos: título, subtítulo, destaque (inputs simples)
- Gerenciar Diferenciais: CRUD para 4 cards (título, descrição, emoji icone)
- Gerenciar Vantagens: add/delete lista de benefícios
- Gerenciar Passos: CRUD para 4 passos (número, título, descrição)
- Salvar em `TAB_CONFIGURACAO` (chaves JSON)
- Toast de feedback
- Auditoria em cada save
- Link "Ver Página" para preview

#### Auditoria (`/admin/auditoria`)
- [ ] Implementado
- Tabela com logs de `TAB_AUDITORIA`
- Colunas: usuário, ação (CREATE/UPDATE/DELETE), tabela, registro_id, timestamp, IP, user_agent
- Filtros: usuário, ação, tabela, data range
- JSON expandível para `dados_antigos` / `dados_novos`
- Read-only (sem ações diretas)

---

## 3. Requisitos Não-Funcionais

### 3.1 Autenticação & Segurança
- [ ] Senhas armazenadas em texto plano (⚠️ **não é seguro para produção**)
- [ ] Cookie `admin_usuario` é não-httpOnly (lido pelo client)
- [ ] `sessionStorage` armazena estado de login (perde ao fechar aba)
- **TODO**: Implementar hash de senha (bcryptjs) + httpOnly cookies

### 3.2 Auditoria
- [ ] Toda ação CREATE/UPDATE/DELETE registra em `TAB_AUDITORIA`
- [ ] Função `registrarAuditoria()` em `src/lib/auditoria.ts`
- [ ] Capturar: usuário (cookie), IP, user-agent, dados antes/depois

### 3.3 Tema & Personalização
- [ ] Cores armazenadas em `TAB_CONFIGURACAO`
- [ ] `TemaProvider.tsx` carrega cores e injeta CSS variables
- [ ] Tema persiste entre sessões (no banco)

### 3.4 Upload & Mídia
- [ ] Todas as imagens/vídeos armazenados em Cloudinary
- [ ] URLs salvas em `TAB_CARRO_IMAGEM` e `TAB_MIDIA`
- [ ] Suporta múltiplas imagens por carro com ordem de exibição
- [ ] Deletar do banco = remover referência, Cloudinary cleanup manual

### 3.5 Email
- [ ] Nodemailer + Gmail (SMTP)
- [ ] Credenciais: `EMAIL_USER`, `EMAIL_PASS` (app password)
- [ ] Envios: confirmação de contato
- **TODO**: Template de email HTML

### 3.6 Performance
- [ ] Pool de conexões PostgreSQL em `src/lib/db.ts`
- [ ] Imagens otimizadas via Cloudinary (responsive, lazy-loading)
- **TODO**: Cache em cliente/CDN

### 3.7 SEO & Acessibilidade
- [ ] Meta tags (title, description) em rotas públicas
- [ ] Imagens com alt text
- [ ] Semântica HTML5
- **TODO**: Schema.org (product, organization)

---

## 4. Especificações Técnicas

### 4.1 Banco de Dados (PostgreSQL)

**Tabelas**:
- `TAB_CARRO` — veículos (id, marca, modelo, ano, preco, descricao, ativo, created_at)
- `TAB_CARRO_IMAGEM` — imagens por carro (id, carro_id FK, url_cloudinary, ordem, created_at)
- `TAB_MIDIA` — mídia do site (id, secao, tipo, url, ordem)
- `TAB_CONFIGURACAO` — key-value tema (id, chave, valor)
- `TAB_USUARIO` — admin users (id, nome, email, senha, ativo)
- `TAB_AUDITORIA` — audit log (id, usuario, acao, tabela, registro_id, dados_antigos, dados_novos, timestamp, ip, user_agent)
- `TAB_LEAD_ETAPA` — etapas do funil com nome, ordem e cor
- `TAB_LEAD` — leads com origem, etapa, responsável e valor estimado
- `TAB_LEAD_INTERACAO` — histórico de contatos por lead (ligação, WhatsApp, etc.)
- `TAB_LEAD_TAREFA` — tarefas e follow-ups com prazo e status

### 4.2 Estrutura de Pastas

```
src/
├── app/
│   ├── (public)/              # Rotas públicas
│   │   ├── page.tsx          # Home
│   │   ├── estoque/
│   │   ├── carro/[id]/
│   │   ├── empresa/
│   │   ├── servicos/
│   │   ├── contato/
│   │   └── entrar/
│   ├── admin/                 # Rotas protegidas
│   │   ├── layout.tsx        # Proteção + redirect
│   │   ├── dashboard/
│   │   ├── carros/
│   │   ├── midia/
│   │   ├── personalizacao/
│   │   └── auditoria/
│   ├── api/                   # Route Handlers
│   │   ├── login
│   │   ├── logout
│   │   ├── upload
│   │   ├── carros/           # CRUD carros
│   │   ├── midia/            # CRUD mídia
│   │   ├── configuracao/     # Temas
│   │   └── auditoria/        # Logs
│   └── globals.css
├── components/                # Componentes React
│   ├── TemaProvider.tsx      # Injetor de cores
│   └── ...
├── lib/
│   ├── db.ts                 # Pool PostgreSQL + query()
│   ├── cloudinary.ts         # Config Cloudinary
│   ├── auditoria.ts          # Logging
│   └── ...
└── types/
```

### 4.3 Variáveis de Ambiente

```
DATABASE_URL=postgresql://user:password@host:5432/db
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=app-password-gerado
NODE_ENV=production
```

### 4.4 Dependências Principais

- `next@14` — framework
- `pg` — driver PostgreSQL
- `cloudinary` — SDK Cloudinary
- `nodemailer` — SMTP emails
- `bcryptjs` — instalado mas não usado (senhas em plaintext)
- CSS Modules — styling

---

## 5. Status de Implementação

### Implementado ✅
- [x] Estrutura base Next.js 14 + App Router
- [x] Conexão PostgreSQL com pool (`src/lib/db.ts`)
- [x] Autenticação session-based (sessionStorage + cookies)
- [x] Schema de banco de dados completo (6 tabelas)
- [x] Sistema de auditoria (`TAB_AUDITORIA`)
- [x] Página Financiamento (`/financiamento`) com formulário e conteúdo gerenciado
- [x] Admin Financiamento (`/admin/financiamento`) com CRUD completo
- [x] API `/api/financiamento-contato` com envio de email
- [x] TemaProvider (injeção dinâmica de cores/CSS)
- [x] CRM: captura automática de leads via /contato e /financiamento
- [x] CRM: dashboard com métricas (total, conversão, ticket médio, tarefas vencidas)
- [x] CRM: lista de leads com filtros por etapa e origem
- [x] CRM: detalhe do lead com histórico de interações e tarefas
- [x] CRM: funil Kanban (Novo → Contactado → Negociação → Ganho → Perdido)
- [x] CRM: tarefas com prazo e conclusão via checkbox
- [x] CRM: relatórios de conversão com gráfico de barras e funil
- [x] CRM: configurações de etapas do funil

### Em Desenvolvimento 🔄
- [ ] Páginas públicas principais (Home, Estoque, Detalhe, Empresa, Serviços)
- [ ] Formulário de contato público com envio de email
- [ ] Admin de carros (listar, criar, editar, deletar + imagens)
- [ ] Admin de mídia (carousels, galerias por seção)
- [ ] Admin de personalização (cores, tema)
- [ ] Admin de auditoria (visualização de logs)

### Backlog 🔒 (Segurança - Crítico)
- [ ] Hash de senha com bcryptjs (senhas em plaintext é risco)
- [ ] httpOnly cookies para sessão (não ler via sessionStorage)
- [ ] HTTPS em produção
- [ ] Rate limiting em APIs
- [ ] CSRF protection em formulários

### Backlog 📋 (Melhorias)
- [ ] Email templates HTML
- [ ] Busca/filtros avançados de veículos
- [ ] Testes automatizados (unit + integration)
- [ ] Cache em cliente/CDN
- [ ] SEO/Schema.org markup
- [ ] Otimização de performance (Core Web Vitals)
- [ ] Sistema de notificações (admin alerts)
- [ ] 2FA para admin
- [ ] Dark mode

---

## 6. Fluxo de Desenvolvimento

### Antes de implementar algo:
1. Consulte a documentação no Obsidian (`C:\Users\Lucas\Documents\Obsidian Vault\CONCESSIONARIA-SITE\`)
2. Verifique o status em **Seção 5** deste SPEC
3. Siga as convenções: tabelas `TAB_*`, classes CSS em português, all queries via `query()`

### Ao completar um requisito:
1. Registre auditoria se aplicável
2. Atualize o status aqui (✅)
3. Commit com mensagem em português: `feat:` / `fix:` / `refactor:`

---

## 7. Contato & Suporte

**Projeto**: Lucas Veículos  
**Localização**: Araçatuba, SP  
**Email**: desenvolvimentosoft01@gmail.com  

Documentação completa no Obsidian vault.
