# 🏗️ ARCHITECTURE.md - Arquitetura do Projeto

## 📐 Visão Geral da Arquitetura

**Lucas Veículos** segue uma arquitetura em camadas com separação clara entre frontend (Next.js) e backend (Node.js API Routes).



## 🔷 Componentes/Módulos Principais

### Frontend (React + Next.js)

**Camada de Apresentação:**
-  — Navegação principal
-  — Rodapé
-  — Injeção dinâmica de CSS
- Componentes de página: Home, Estoque, Detalhe, Admin, etc

**Estrutura:**


### Backend (Next.js API Routes)

**Serviços Principais:**

1. **Autenticação** ()
   - Valida email/senha contra 
   - Seta cookie 
   - Armazena no  do client

2. **Cloudinary** ()
   - Upload de imagens/vídeos
   - Gerenciamento de assets
   - URLs persistidas em DB

3. **Email** ()
   - Nodemailer + Gmail SMTP
   - Templates de contato e financiamento

4. **Auditoria** ()
   - Registra CREATE/UPDATE/DELETE
   - Captura IP, user-agent, usuário
   - Armazena em 

## 📊 Fluxo de Dados (Exemplo: Criar Novo Carro)



## 🔐 Camadas de Segurança

### Autenticação
- [x] Session-based (sessionStorage + cookies)
- [ ] **TODO**: HttpOnly cookies + server-side sessions

### Autorização
- [x] Proteção de rotas admin via  check em layout.tsx
- [ ] **TODO**: JWT tokens com refresh

### Validação
- [x] Validação client-side (HTML5 + JS)
- [x] Validação server-side em APIs
- [ ] **TODO**: Sanitização contra SQL injection (usar prepared statements)

### Criptografia
- [ ] **TODO**: Hash de senhas (bcryptjs)
- [ ] **TODO**: HTTPS em produção
- [ ] **TODO**: Rate limiting

### Auditoria
- [x] Toda ação CREATE/UPDATE/DELETE registrada
- [x] Captura usuário, IP, user-agent
- [x] JSON com dados antes/depois

## 📈 Escalabilidade

### Banco de Dados
- Pool de conexões PostgreSQL ( library)
- Queries otimizadas com índices em PK/FK
- **TODO**: Replicação para HA

### Imagens
- Cloudinary garante delivery rápido via CDN
- Transformações sob demanda (resize, compress)
- **TODO**: Cache em cliente (stale-while-revalidate)

### API
- Next.js API Routes (serverless em produção)
- Sem sessions memória (stateless)
- **TODO**: Rate limiting por IP

## 🚀 Melhorias Futuras
- [ ] Cache em cliente/CDN
- [ ] Busca avançada com Elasticsearch
- [ ] Analytics com Google Analytics
- [ ] Notificações por email/SMS
- [ ] Mobile app (React Native)
- [ ] Integrações: Mercado Pago, iCauta (crédito)
- [ ] Dark mode
- [ ] Internacionalização (EN/ES)

---
**Última atualização**: 2026-05-19
