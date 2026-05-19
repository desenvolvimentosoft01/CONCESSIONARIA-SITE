# 📋 PLAN.md — Roadmap de Desenvolvimento

**Versão**: 1.0  
**Data**: 2026-05-19  
**Objetivo**: Completar o MVP e expandir para funcionalidades completas

---

## 🗺️ Visão Geral das Fases

```
┌─────────────────────────────────────────────────────┐
│ Fase 1: MVP Base (Site Público + Admin Carros)     │
│ ~2 semanas                                          │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Fase 2: Admin Completo (Mídia, Tema, Auditoria)    │
│ ~1-2 semanas                                        │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Fase 3: Segurança & Performance (Crítico)          │
│ ~1 semana                                           │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Fase 4: Polimento & Deploy                          │
│ ~1 semana                                           │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Fase 1: MVP Base (Site Público + Admin Carros)

**Objetivo**: Ter o site público funcional e gerenciamento básico de carros.  
**Duração Estimada**: 2 semanas  
**Critério de Conclusão**: Site ao vivo com estoque visível e admin conseguindo criar/editar carros.

### 1.1 Páginas Públicas

#### Home (`/`)
- [ ] Banner/hero section com imagem destacada
- [ ] Grid de carros destaque (últimos 6)
- [ ] Seção de diferenciais (cards)
- [ ] Call-to-action para estoque e contato
- [ ] Footer com contato
- **Dependências**: Componentes Header/Footer, TemaProvider funcional
- **Estimativa**: 2 dias

#### Estoque (`/estoque`)
- [ ] Listar todos os carros (paginados, 12 por página)
- [ ] Filtros: marca, modelo, faixa de preço, ano
- [ ] Busca por texto (marca + modelo)
- [ ] Card de carro: imagem, marca, modelo, ano, preço
- [ ] Link para detalhe
- **Dependências**: Cards de carro, filtros
- **Estimativa**: 2 dias

#### Detalhe do Carro (`/carro/[id]`)
- [ ] Galeria de imagens (carousel/lightbox)
- [ ] Informações: marca, modelo, ano, descrição, preço
- [ ] Botão "Entrar em Contato"
- [ ] Carros relacionados (mesmo marca)
- **Dependências**: Componente galeria, API de carros
- **Estimativa**: 2 dias

#### Empresa (`/empresa`)
- [ ] Informações sobre Lucas Veículos (texto fixo ou config)
- [ ] Galeria de fotos da empresa
- [ ] Dados de contato (endereço, telefone, email)
- [ ] Mapa (Google Maps ou iframe)
- **Dependências**: TemaProvider, mídia do site
- **Estimativa**: 1-2 dias

#### Serviços (`/servicos`)
- [ ] Cards de serviços (financiamento, troca, etc)
- [ ] Descrição e benefícios de cada serviço
- [ ] Links para páginas relacionadas
- **Dependências**: Componentes simples
- **Estimativa**: 1 dia

#### Contato (`/contato`)
- [ ] Formulário: nome, email, telefone, assunto, mensagem
- [ ] Validação client + server
- [ ] Enviar email via `/api/contato`
- [ ] Feedback de sucesso/erro
- **Dependências**: API de email (nodemailer)
- **Estimativa**: 2 dias

#### Login (`/entrar`)
- [ ] Formulário: email + senha
- [ ] Validação contra `TAB_USUARIO`
- [ ] Comparação plaintext (TODO: hash depois)
- [ ] Redirect para `/admin/dashboard` em sucesso
- [ ] Mensagens de erro
- **Dependências**: API `/api/login`
- **Estimativa**: 1 dia

### 1.2 Admin de Carros

#### Dashboard (`/admin/dashboard`)
- [ ] Menu/sidebar com links para:
  - Carros
  - Mídia
  - Personalizacao
  - Auditoria
  - Logout
- [ ] Widget: total de carros
- [ ] Widget: últimas 5 ações de auditoria
- **Dependências**: Layout protegido
- **Estimativa**: 1 dia

#### Listar Carros (`/admin/carros`)
- [ ] Tabela com: foto, marca, modelo, ano, preço, ativo
- [ ] Botões: editar, deletar, toggle ativo
- [ ] Confirmação antes de deletar
- [ ] Botão "Novo Carro"
- [ ] Paginação
- **Dependências**: API de carros
- **Estimativa**: 2 dias

#### Novo Carro (`/admin/carros/novo`)
- [ ] Formulário: marca, modelo, ano, preço, descricao, ativo
- [ ] Upload múltiplo de imagens (Cloudinary)
- [ ] Preview de imagens
- [ ] Reordenação de imagens (drag-and-drop ou input)
- [ ] Salvar em `TAB_CARRO` + `TAB_CARRO_IMAGEM`
- [ ] Registrar auditoria
- **Dependências**: Cloudinary SDK, componente upload
- **Estimativa**: 3 dias

#### Editar Carro (`/admin/carros/editar/[id]`)
- [ ] Formulário pré-preenchido
- [ ] Editar dados do carro
- [ ] Gerenciar imagens: adicionar, deletar, reordenar
- [ ] Salvar mudanças
- [ ] Registrar auditoria
- **Dependências**: Mesmo que "Novo Carro"
- **Estimativa**: 2 dias

---

## 🚀 Fase 2: Admin Completo + Públicas Secundárias

**Objetivo**: Completar admin e páginas públicas restantes.  
**Duração Estimada**: 1-2 semanas  
**Dependências**: Fase 1 completa

### 2.1 Admin de Mídia

#### Gerenciar Mídia (`/admin/midia`)
- [ ] Abas por seção (carousel_home, about_galeria, etc)
- [ ] Upload múltiplo (imagens + vídeos)
- [ ] Listar mídia por seção
- [ ] Reordenar
- [ ] Deletar
- [ ] Registrar auditoria
- **Estimativa**: 2 dias

### 2.2 Admin de Tema

#### Personalização (`/admin/personalizacao`)
- [ ] Inputs de cor para: cor_primaria, cor_header, cor_footer
- [ ] Preview em tempo real
- [ ] Salvar em `TAB_CONFIGURACAO`
- [ ] Registrar auditoria
- **Estimativa**: 1 dia

### 2.3 Admin de Auditoria

#### Visualizar Auditoria (`/admin/auditoria`)
- [ ] Tabela com logs: usuário, ação, tabela, timestamp
- [ ] Filtros: usuário, ação, tabela, data range
- [ ] JSON expandível de dados_antigos/dados_novos
- [ ] Read-only
- **Estimativa**: 1-2 dias

### 2.4 APIs Necessárias

- [x] `/api/login` — Autenticação
- [x] `/api/logout` — Logout
- [x] `/api/upload` — Upload para Cloudinary
- [x] `/api/contato` — Envio de contato
- [x] `/api/financiamento-contato` — Envio de financiamento
- [ ] `/api/carros` — CRUD de carros
- [ ] `/api/carros/[id]` — Get/Update/Delete
- [ ] `/api/carro-imagem` — CRUD de imagens
- [ ] `/api/midia` — CRUD de mídia
- [ ] `/api/configuracao` — Get/Update de config
- [ ] `/api/auditoria` — List com filtros

---

## 🔒 Fase 3: Segurança & Performance (CRÍTICO)

**Objetivo**: Corrigir vulnerabilidades antes de produção.  
**Duração Estimada**: 1 semana  
**Prioridade**: ALTA

### 3.1 Segurança

#### Hashing de Senhas
- [ ] Instalar/usar `bcryptjs`
- [ ] Hash no signup/update de usuário
- [ ] Comparar hash no login
- [ ] Testar com senhas existentes
- **Estimativa**: 1 dia

#### HttpOnly Cookies
- [ ] Migrar de sessionStorage para server-side session
- [ ] Usar httpOnly cookies para `admin_session`
- [ ] Implementar refresh token
- [ ] Testar logout/expiration
- **Estimativa**: 2 dias

#### Validação & Sanitização
- [ ] Validar todos os inputs em server-side
- [ ] Sanitizar strings (SQL injection prevention)
- [ ] Validar tipos de arquivo (upload)
- **Estimativa**: 1 dia

#### Rate Limiting
- [ ] Implementar rate limiting em `/api/login`
- [ ] Implementar em `/api/upload`
- **Estimativa**: 1 dia

#### CSRF Protection
- [ ] Implementar tokens CSRF em formulários
- [ ] Validar em POST/PUT/DELETE
- **Estimativa**: 1 dia

### 3.2 Performance

#### Otimização de Imagens
- [ ] Configurar transformações Cloudinary (resize, compress)
- [ ] Lazy-loading em galerias
- [ ] Imagens responsivas (srcset)
- **Estimativa**: 1-2 dias

#### Cache
- [ ] Cache de carros em cliente (stale-while-revalidate)
- [ ] Cache headers em APIs
- **Estimativa**: 1 dia

---

## 🎯 Fase 4: Polimento & Deploy

**Objetivo**: Preparar para produção.  
**Duração Estimada**: 1 semana

### 4.1 QA & Testes

- [ ] Testar fluxo completo no navegador
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Testar upload de imagens
- [ ] Testar envio de emails
- [ ] Testar login/logout
- [ ] Testar criação/edição/deleção de carros
- **Estimativa**: 2-3 dias

### 4.2 SEO & Meta Tags

- [ ] Adicionar meta tags em páginas públicas
- [ ] Open Graph (og:image, og:title, etc)
- [ ] Schema.org (Product, Organization)
- [ ] Sitemap XML
- **Estimativa**: 1 dia

### 4.3 Documentação

- [ ] Atualizar CLAUDE.md
- [ ] Documentar APIs em comentários/JSDoc
- [ ] README do projeto
- **Estimativa**: 1 dia

### 4.4 Deploy

- [ ] Configurar variáveis de ambiente em produção
- [ ] Testar em staging
- [ ] Deploy em produção
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Monitoramento (Sentry/LogRocket)
- **Estimativa**: 2-3 dias

---

## 📌 Tarefas Atuais (Próximas Ações)

### Esta Semana (19-26 maio)
- [ ] Completar home page (`/`)
- [ ] Completar estoque (`/estoque`)
- [ ] Completar detalhe de carro (`/carro/[id]`)
- [ ] Completar login (`/entrar`)
- [ ] API `/api/carros` (GET all, GET by id)
- [ ] Admin listagem de carros
- [ ] Refinar componentes Header/Footer

### Próxima Semana (26 maio - 2 junho)
- [ ] Admin novo carro (com upload Cloudinary)
- [ ] Admin editar carro
- [ ] Admin deletar carro
- [ ] Completar páginas Empresa e Serviços
- [ ] Completar página Contato + envio de email
- [ ] Testes gerais

---

## 🔄 Definição de Pronto (Definition of Done)

Para cada tarefa:
- [ ] Código implementado e funcional
- [ ] Auditoria registrada (se aplicável)
- [ ] Testado manualmente no navegador
- [ ] Commit com mensagem clara (português): `feat:`, `fix:`, `refactor:`
- [ ] Sem console.log ou código comentado
- [ ] CSS/componentes seguem convenção (Portuguese naming)
- [ ] Acessibilidade básica (alt text em imagens, semântica HTML)

---

## 📊 Estimativa Total

```
Fase 1 (MVP Base):        14 dias
Fase 2 (Admin Completo):   7-10 dias
Fase 3 (Segurança):        7 dias
Fase 4 (Polimento):        7 dias
─────────────────────────────────
TOTAL ESTIMADO:           35-38 dias (~6-7 semanas)
```

**Margem de Segurança**: +20% para imprevistos = ~50 dias (~10 semanas)

---

## 📍 Pontos de Verificação (Milestones)

1. **Milestone 1 (EOW maio 26)**: Fase 1 completa - site público MVP navegável
2. **Milestone 2 (EOW junho 2)**: Fase 2 completa - admin fully functional
3. **Milestone 3 (EOW junho 9)**: Fase 3 completa - segurança implementada
4. **Milestone 4 (EOW junho 16)**: Fase 4 + Deploy em produção ✅

---

## 🔗 Recursos

- **Documentação Técnica**: `CLAUDE.md`, Obsidian Vault
- **Especificação**: `SPEC.md`
- **Database**: PostgreSQL schema em `02-Banco-de-Dados.md` (Obsidian)
- **Cloudinary**: `07-Cloudinary.md` (Obsidian)

---

**Última atualização**: 2026-05-19  
**Próxima revisão**: 2026-05-26
