# Configuracao e Setup

## Variaveis de Ambiente

Arquivo: `.env.local` (nao versionado no git)

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/concessionaria

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Email (Gmail)
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app          # Usar "App Password" do Gmail, nao a senha normal
CONTACT_RECIPIENT_EMAIL=email_que_recebe@gmail.com

# WhatsApp via Evolution API
EVOLUTION_API_URL=https://chat.exemplo.com     # URL base da sua instancia Evolution
EVOLUTION_API_KEY=sua_api_key_evolution
EVOLUTION_INSTANCE=nome_da_instancia           # Nome da instancia WhatsApp
WHATSAPP_NUMERO_DONO=5518999999999             # Numero do dono em formato E.164

# Site
NEXT_PUBLIC_SITE_URL=https://seusite.com.br    # URL publica do site deployado
```

### Como Gerar Credenciais

#### PostgreSQL
```bash
# Criar banco localmente
psql -U postgres
CREATE DATABASE concessionaria;
```

#### Cloudinary
1. Acesse: https://cloudinary.com/
2. Crie uma conta (gratuita)
3. Dashboard -> Settings -> API Keys -> copiar Cloud Name, API Key, API Secret

#### Email (Gmail)
1. Ative 2FA na conta Google
2. Gere uma "App Password": https://myaccount.google.com/apppasswords
3. Use a senha gerada (16 caracteres) em `EMAIL_PASS`

#### Evolution API (WhatsApp)
1. Tenha uma instancia do Evolution API rodando (self-hosted ou cloud)
2. Crie uma instancia e conecte um numero WhatsApp via QR Code
3. Copie a URL base, a API key e o nome da instancia

## Setup Local

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar .env.local
Crie o arquivo `.env.local` na raiz do projeto com todas as variaveis acima.

### 3. Preparar Banco de Dados

#### Opcao A: Script Automatizado (recomendado)
```bash
node scripts/setup-db.mjs
```

Este script cria todas as tabelas e insere dados iniciais (etapas do CRM, configuracoes padrao).

#### Opcao B: Criar Tables Manualmente

Conecte ao banco e execute os DDLs do [02-Banco-de-Dados.md](02-Banco-de-Dados.md).

Em seguida insira dados iniciais:

```sql
-- Usuario admin padrao
INSERT INTO TAB_USUARIO (nome, email, senha, ativo)
VALUES ('Admin', 'admin@example.com', 'admin123', true);

-- Etapas do CRM
INSERT INTO TAB_LEAD_ETAPA (nome, ordem, cor) VALUES
  ('Novo',        1, '#6B7280'),
  ('Contactado',  2, '#3B82F6'),
  ('Negociacao',  3, '#F59E0B'),
  ('Ganho',       4, '#10B981'),
  ('Perdido',     5, '#EF4444');

-- Configuracoes de tema (valores padrao)
INSERT INTO TAB_CONFIGURACAO (chave, valor, categoria, tipo) VALUES
  ('cor_primaria',   '#FF6B35', 'cores', 'color'),
  ('cor_secundaria', '#4B5563', 'cores', 'color'),
  ('cor_header',     '#1F2937', 'cores', 'color'),
  ('cor_footer',     '#111827', 'cores', 'color'),
  ('cor_fundo_card', '#FFFFFF', 'cores', 'color'),
  ('cor_texto',      '#1F2937', 'cores', 'color');
```

### 4. Iniciar Dev Server
```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Login Admin
- Acesse: http://localhost:3000/entrar
- Email: `admin@example.com`
- Senha: `admin123`

---

## Tema/Personalizacao

### O que e Tema?

Cores CSS armazenadas em `TAB_CONFIGURACAO`:

| Chave | Exemplo | Uso |
|-------|---------|-----|
| `cor_primaria` | `#FF6B35` | CTA, botoes principais |
| `cor_secundaria` | `#4B5563` | Links, destaques |
| `cor_header` | `#1F2937` | Fundo do header |
| `cor_footer` | `#111827` | Fundo do footer |
| `cor_fundo_card` | `#FFFFFF` | Fundo de cards |
| `cor_texto` | `#1F2937` | Texto principal |

### Como Funciona

1. **Armazenamento:** `TAB_CONFIGURACAO` (chave-valor com categoria, tipo e descricao)
2. **Fetch:** TemaProvider (`src/components/TemaProvider.tsx`) busca em `/api/configuracao` na montagem
3. **Injecao:** bloco `<style>` com CSS variables:
```css
:root {
  --cor-primaria: #FF6B35;
  --cor-header: #1F2937;
  /* ... */
}
```
4. **Componentes usam:** `var(--cor-primaria)` no CSS

### Editar Tema

**Via Admin Panel:** `/admin/configuracoes/cores`

Ou direto no banco:
```sql
UPDATE TAB_CONFIGURACAO SET valor = '#00FF00' WHERE chave = 'cor_primaria';
```

### Textos da Pagina de Financiamento

A aba `/admin/configuracoes/textos` permite editar o conteudo exibido na pagina `/financiamento`. Esses textos tambem ficam em `TAB_CONFIGURACAO` com categoria `textos`.

---

## Comandos do Projeto

```bash
# Desenvolvimento
npm run dev

# Build para producao
npm run build

# Servidor de producao
npm start

# Setup do banco de dados
node scripts/setup-db.mjs
```

---

## Build e Deploy

### Vercel (Recomendado)

O projeto e deployado na Vercel via git push:

1. Conecte o repositorio na Vercel
2. Configure as variaveis de ambiente no painel da Vercel (mesmas do `.env.local`)
3. O deploy acontece automaticamente a cada push para `main`

Ou via atalho:
```
deploy
```

### Build Local para Inspecao

```bash
npm run build
npm start
```

Acesse `http://localhost:3000` para verificar o build de producao localmente.

---

## Troubleshooting

### Erro: "Cannot find module 'pg'"
```bash
npm install
```

### Erro: "DATABASE_URL not found"
Verifique se `.env.local` existe na raiz do projeto e contem `DATABASE_URL`.

### Cloudinary upload falha
- Verificar credenciais (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- Reiniciar o servidor de dev apos alterar `.env.local`

### Email nao envia
- Verificar `EMAIL_USER` e `EMAIL_PASS`
- Garantir que Gmail tem 2FA ativo e App Password gerada
- `EMAIL_PASS` deve ser a senha de app (16 caracteres), nao a senha normal

### WhatsApp nao notifica
- Verificar `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`
- Verificar que a instancia Evolution esta conectada (QR code escaneado)
- Verificar `WHATSAPP_NUMERO_DONO` no formato E.164 (ex: `5518999999999`)
- Falhas na Evolution API sao silenciosas (nao bloqueiam o fluxo do usuario)

### Lead nao e criado ao preencher formulario
- Verificar que `TAB_LEAD_ETAPA` tem ao menos uma etapa cadastrada
- Verificar logs do servidor de dev

---

## Checklist Pre-Producao

- [ ] `.env.local` configurado com todas as variaveis no servidor / Vercel
- [ ] Banco criado e tabelas criadas via `node scripts/setup-db.mjs`
- [ ] Etapas do CRM cadastradas
- [ ] Usuario admin criado com senha segura
- [ ] SSL/HTTPS habilitado (Vercel faz automaticamente)
- [ ] Cloudinary com limite de storage monitorado
- [ ] Email com App Password configurado
- [ ] WhatsApp Evolution API conectado e testado
- [ ] `NEXT_PUBLIC_SITE_URL` apontando para a URL de producao
