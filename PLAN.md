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

## ✅ Fase 1: MVP Base (Site Público + Admin Carros) — CONCLUÍDA

**Objetivo**: Ter o site público funcional e gerenciamento básico de carros.  
**Concluída em**: maio/2026

### 1.1 Páginas Públicas

#### Home (`/`)
- [x] Banner/hero section com imagem destacada
- [x] Grid de carros destaque (últimos 6)
- [x] Seção de diferenciais (cards)
- [x] Call-to-action para estoque e contato
- [x] Footer com contato

#### Estoque (`/estoque`)
- [x] Listar todos os carros disponíveis
- [x] Filtros: marca, modelo, faixa de preço, ano
- [x] Busca por texto (marca + modelo)
- [x] Card de carro: imagem, marca, modelo, ano, preço
- [x] Link para detalhe

#### Detalhe do Carro (`/carro/[id]`)
- [x] Galeria de imagens/vídeos (VehicleMediaViewer)
- [x] Informações: marca, modelo, ano, km, combustível, cor, preço, descrição
- [x] Botão WhatsApp com captura de lead (`BotaoWhatsApp`)
- [x] Botão de contato → `/contato?carro_id=[id]`

#### Empresa, Serviços, Financiamento, Contato
- [x] Todas implementadas com conteúdo real
- [x] Formulários de contato e financiamento com validação, e-mail e captura de lead

#### Login (`/entrar`)
- [x] Formulário email + senha contra `TAB_USUARIO`
- [x] Redirect para `/admin/dashboard` em sucesso

### 1.2 Admin de Carros

#### Dashboard (`/admin/dashboard`)
- [x] Sidebar global de navegação
- [x] Métricas dinâmicas: veículos disponíveis, leads no CRM, tarefas vencidas

#### Listar Carros (`/admin/carros`)
- [x] Tabela com foto, marca, modelo, ano, preço
- [x] Botões editar e deletar (com confirmação)
- [x] Botão "Novo Carro"

#### Novo Carro (`/admin/carros/novo`)
- [x] Formulário completo com upload múltiplo de imagens (Cloudinary)
- [x] Salva em `TAB_CARRO` + `TAB_CARRO_IMAGEM`
- [x] Registra auditoria

#### Editar Carro (`/admin/carros/editar/[id]`)
- [x] Formulário pré-preenchido
- [x] Gerenciamento de imagens
- [x] Registra auditoria

---

## ✅ Fase 2: Admin Completo + CRM — CONCLUÍDA

**Objetivo**: Completar admin e páginas públicas restantes.  
**Concluída em**: maio/2026

### 2.1 Admin de Mídia
- [x] `/admin/midia` — Upload múltiplo por seção, listar, deletar, auditoria

### 2.2 Admin de Tema
- [x] `/admin/personalizacao` — Inputs de cor, preview em tempo real, salva em `TAB_CONFIGURACAO`

### 2.3 Admin de Auditoria
- [x] `/admin/auditoria` — Tabela com logs, filtros, JSON expandível

### 2.4 CRM (adicionado além do escopo original)
- [x] Pipeline de leads com etapas configuráveis
- [x] Captura automática via formulários e botão WhatsApp
- [x] Notificação WhatsApp ao dono via Evolution API
- [x] Histórico de interações e tarefas por lead
- [x] Dashboard CRM com funil, métricas e alerta de leads esfriando
- [x] Ao mover para "Ganho": marca veículo como indisponível automaticamente
- [x] Vinculação de lead a veículo (carro_id)

### 2.5 APIs implementadas
- [x] `/api/login` e `/api/logout`
- [x] `/api/upload` — Cloudinary
- [x] `/api/contact` e `/api/financiamento-contato`
- [x] `/api/carros` — CRUD completo
- [x] `/api/carros/[id]` — GET / DELETE
- [x] `/api/carros/[id]/interesse` — captura de lead via WhatsApp
- [x] `/api/midia` — CRUD de mídia por seção
- [x] `/api/configuracao` — GET / UPDATE de config
- [x] `/api/auditoria` — listagem com filtros
- [x] `/api/leads` — CRUD de leads
- [x] `/api/leads/[id]` e sub-rotas (interacoes, tarefas, dashboard)

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

## 📌 Próximas Prioridades (mai/2026)

### Fase 3 — Segurança (pendente)
- [ ] Hash de senhas com bcryptjs (pacote instalado, não usado)
- [ ] HttpOnly cookies para admin session
- [ ] Rate limiting em `/api/login` e `/api/upload`

### Fase 4 — Polimento
- [ ] SEO: meta tags e Open Graph nas páginas públicas
- [ ] Sitemap XML
- [ ] CI/CD (GitHub Actions → Vercel)

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
