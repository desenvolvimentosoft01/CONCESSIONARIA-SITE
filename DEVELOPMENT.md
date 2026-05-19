# 🛠️ DEVELOPMENT.md - Guia de Desenvolvimento

## 🚀 Comecando

### Pre-requisitos
- Node.js v18+ (verificar com `node -v`)
- npm ou yarn
- PostgreSQL 12+ (local ou remoto)
- Git

### Setup Inicial

```bash
# Clonar o repositorio (se necessario)
git clone [url]
cd "Site para Concessionaria/Concessionaria_Site"

# Instalar dependencias
npm install

# Criar .env.local com variaveis de ambiente
# (ver CLAUDE.md na secao Environment Variables)

# Executar em desenvolvimento
npm run dev

# Acessar em http://localhost:3000
```

## 📦 Gerenciando Dependencias

### Instalar nova dependencia
```bash
npm install package-name
```

### Remover dependencia
```bash
npm uninstall package-name
```

### Verificar versoes instaladas
```bash
npm list
```

**Dependencias Principais:**
- `next@14` — Framework web
- `react@18` — UI library
- `pg` — Driver PostgreSQL
- `cloudinary` — SDK Cloudinary
- `nodemailer` — SMTP emails
- `bcryptjs` — Hash de senhas (instalado mas nao usado)

## 🧪 Testando

**Nota**: Nao ha test runner configurado no projeto. Testes sao manuais.

### Testes Manuais
1. Iniciar dev server: `npm run dev`
2. Testar funcionalidades no navegador (Chrome/Firefox/Edge)
3. Usar Chrome DevTools (F12) para debugar
4. Verificar Network tab para requisicoes HTTP

### Testes de API
Use curl, Postman ou REST Client (VSCode):

```bash
# Exemplo: GET de carros
curl http://localhost:3000/api/carros

# Exemplo: POST de novo carro
curl -X POST http://localhost:3000/api/carros \
  -H "Content-Type: application/json" \
  -d '{"marca":"Ford","modelo":"Fiesta","ano":2023,"preco":45000}'
```

## 🔍 Debugging

### Browser DevTools
- Pressionar `F12` para abrir
- Aba **Console** para ver logs
- Aba **Network** para ver requisicoes HTTP
- Aba **Application** para ver sessionStorage/localStorage

### React DevTools
- Instalar extensao do navegador
- Inspecionar componentes React em tempo real
- Ver props e state

### Logs do Servidor
- Abrir terminal onde `npm run dev` esta rodando
- Ver logs de requisicoes e erros

### Debugar Banco de Dados
- Usar cliente PostgreSQL (pgAdmin, DBeaver, psql)
- Conectar com `DATABASE_URL` de `.env.local`
- Testar queries manualmente

## 📝 Commits e Branches

### Convencion de Commits
Sempre usar imperative mood em portugues:

```
feat: adiciona nova funcionalidade
fix: corrige bug em X
refactor: reorganiza codigo em Y
docs: atualiza documentacao
test: adiciona testes para X
chore: atualiza dependencias
ci: configura CI/CD
```

**Exemplos:**
```
feat: implementa formulario de contato
fix: corrige validacao de email em /contato
refactor: reorganiza TemaProvider para melhor performance
docs: atualiza SPEC.md com novas funcionalidades
```

### Criar Branch
```bash
# Criar e mudar para nova branch
git checkout -b feature/nome-da-tarefa

# Ou com versao mais nova do git
git switch -c feature/nome-da-tarefa
```

**Convencao de nomes:**
- `feature/nova-funcionalidade` — para features novas
- `fix/correcao-bug` — para bug fixes
- `refactor/reorganizar-componente` — para refatoracoes
- `docs/atualizar-readme` — para documentacao

### Fazer Commit
```bash
# Verificar status
git status

# Adicionar arquivos
git add .
# Ou arquivos especificos
git add src/components/Novo.tsx

# Fazer commit
git commit -m "feat: descricao clara da mudanca"

# Ver commits locais nao enviados
git log origin/main..HEAD
```

### Push e Pull Request
```bash
# Fazer push da branch
git push origin feature/nome-da-tarefa

# Ir para GitHub e criar PR
# Preencher descricao do PR com detalhes
```

## 📤 Pull Requests

### Checklist Antes de Fazer PR
- [ ] Codigo implementado e funcional
- [ ] Testado manualmente (navegador + features)
- [ ] Sem console.log ou codigo comentado
- [ ] Sem erros no terminal (next.js)
- [ ] Commit messages claras e em portugues
- [ ] SPEC.md ou PLAN.md atualizado (se necessario)
- [ ] Documentacao adicionada (comentarios/README)

### Descricao do PR
```markdown
## O que muda?
Descrever brevemente as mudancas

## Por que?
Explicar a motivacao ou problema resolvido

## Como testar?
1. Passo 1
2. Passo 2
3. Passo 3

## Screenshots (se UI)
[Adicionar screenshots/GIFs]

## Checklist
- [x] Testado localmente
- [x] Sem breaking changes
- [x] Documentacao atualizada
```

## 🚀 Build e Deploy

### Build Local
```bash
npm run build
# Gera .next/ com otimizacoes
```

### Verificar Build
```bash
npm run start
# Roda producao localmente em http://localhost:3000
```

### Deploy
- Hospedagem recomendada: Vercel (criadores do Next.js)
- Alternativa: Railway, Render, AWS Amplify

**Passos Deploy Vercel:**
1. Fazer push para GitHub
2. Conectar repositorio no Vercel
3. Configurar variaveis de ambiente (.env.local)
4. Deploy automatico em cada push para `main`

## 📂 Estrutura de Pastas

```
Concessionaria_Site/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Rotas publicas (layout)
│   │   ├── admin/             # Rotas protegidas (admin)
│   │   ├── api/               # API Routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Estilos globais
│   │   └── favicon.ico
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilidades
│   │   ├── db.ts             # PostgreSQL pool
│   │   ├── cloudinary.ts     # Cloudinary config
│   │   ├── auditoria.ts      # Audit logging
│   │   └── email.ts          # Nodemailer config
│   └── types/                 # TypeScript interfaces
├── public/                    # Arquivos estaticos
├── .env.local                 # Variaveis de ambiente (local)
├── .env.example               # Exemplo de variaveis
├── .gitignore                 # Arquivos ignorados no Git
├── CLAUDE.md                  # Instrucoes para Claude Code
├── SPEC.md                    # Especificacao do projeto
├── PLAN.md                    # Roadmap
├── ARCHITECTURE.md            # Arquitetura
├── package.json               # Dependencias
├── tsconfig.json              # TypeScript config
├── next.config.js             # Next.js config
└── README.md                  # Documentacao geral
```

## 💡 Dicas Importantes

1. **Sempre ler CLAUDE.md antes de trabalhar** — tem instrucoes importantes
2. **Consultar Obsidian Vault** — documentacao detalhada em `C:\Users\Lucas\Documents\Obsidian Vault\CONCESSIONARIA-SITE\`
3. **Registrar auditoria em APIs** — usar `registrarAuditoria()` em toda acao CREATE/UPDATE/DELETE
4. **Usar query() helper** — nunca fazer query SQL direta, sempre via `src/lib/db.ts`
5. **CSS Modules** — nao usar Tailwind, usar CSS Modules com nomes em portugues
6. **Nomes de tabelas** — sempre usar prefixo `TAB_` em queries

## 🆘 Troubleshooting

### Erro: `DATABASE_URL not found`
- Criar `.env.local` com variaveis do `.env.example`
- Verificar permissoes de conexao ao PostgreSQL

### Erro: Cloudinary upload falha
- Verificar CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Testar credenciais no painel Cloudinary

### Erro: Emails nao sao enviados
- Verificar EMAIL_USER e EMAIL_PASS em `.env.local`
- Usar "App Password" do Gmail (nao senha comum)
- Verificar logs do Nodemailer em terminal

### Porta 3000 ja em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

---

**Precisando de ajuda?** Consulte CLAUDE.md, SPEC.md ou Obsidian Vault!
