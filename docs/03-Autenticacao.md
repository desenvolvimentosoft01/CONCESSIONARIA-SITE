# Autenticacao e Sessao

## Fluxo de Login

```
1. Usuario acessa /entrar
   v
2. Preenche email + senha
   v
3. POST /api/login { email, senha }
   v
4. Servidor valida contra TAB_USUARIO (plain text)
   v
5. Se OK:
   - Set cookie: admin_usuario = "nome_usuario" (nao httpOnly)
   - Response: { success: true, nome: "..." }
   v
6. Cliente recebe resposta
   v
7. Armazena em sessionStorage:
   - admin_logado = "true"
   - admin_nome = "Nome do Usuario"
   v
8. Redireciona para /admin/dashboard
```

## Componentes

### 1. Cookie (Servidor)

**Arquivo:** `src/app/api/login/route.ts`

```typescript
// Ao fazer login com sucesso:
const response = NextResponse.json({ success: true, nome });

response.cookies.set('admin_usuario', nome, {
  httpOnly: false,  // Acessivel via JS (necessario para auditoria client-side)
  path: '/',
  maxAge: 24 * 60 * 60  // 24 horas
});

return response;
```

**Usado para:** Rastreamento de auditoria — `getClientInfo()` le o cookie para saber quem fez o que.

### 2. SessionStorage (Cliente)

**Arquivo:** `src/app/admin/layout.tsx`

```typescript
'use client';

export default function AdminLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const logado = sessionStorage.getItem('admin_logado');
    if (!logado) {
      router.push('/entrar');
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) return null;
  return children;
}
```

**Propriedades armazenadas:**
- `admin_logado` = `"true"` (string)
- `admin_nome` = `"Lucas Silva"` (nome do usuario logado)

## Protecao de Rotas Admin

### Client-side (Primaria)

Componente `AdminLayout` em `src/app/admin/layout.tsx`:

```typescript
if (!sessionStorage.getItem('admin_logado')) {
  router.push('/entrar');
}
```

A protecao ocorre em todas as rotas sob `/admin/*` por heranca do layout pai.

### Auditoria via Cookie (Server-side)

As API routes de mutacao leem o cookie para identificar o usuario responsavel:

```typescript
import { getClientInfo } from '@/lib/auditoria';

export async function POST(req: NextRequest) {
  const usuario = getClientInfo(req);  // le cookie admin_usuario
  
  // ... logica ...
  
  await registrarAuditoria({
    tabela: 'TAB_CARRO',
    acao: 'CREATE',
    dados_antes: null,
    dados_depois: novoCarro,
    usuario,
  });
}
```

**Nota:** As API routes nao bloqueiam requisicoes sem cookie — o cookie e apenas para rastreamento de auditoria. A protecao real e feita pelo sessionStorage no cliente.

## Logout

**Arquivo:** `src/app/api/login/route.ts` (ou rota de logout dedicada)

**Cliente:**

```typescript
const logout = async () => {
  sessionStorage.removeItem('admin_logado');
  sessionStorage.removeItem('admin_nome');
  // Deletar cookie via fetch se houver rota de logout
  router.push('/entrar');
};
```

## Seguranca

### Problemas Atuais

1. **Senhas em plain text** — Armazenadas sem hash em `TAB_USUARIO`
2. **SessionStorage** — Acessivel via XSS
3. **Cookie nao httpOnly** — Acessivel via JavaScript
4. **Sem CSRF protection** — Sem tokens CSRF
5. **Sem bloqueio server-side** — API routes nao verificam autenticacao, so auditoria

### Melhorias Recomendadas

Para producao:

1. **Hash de senhas** — `bcryptjs` ja esta instalado:
```typescript
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(senha, 10);
const ok = await bcrypt.compare(senhaDigitada, hashSalvo);
```

2. **Session segura:**
- Usar JWT com HttpOnly cookie + SameSite=Strict
- Ou session store no servidor (Redis)

3. **Middleware de autenticacao:**
- Criar `src/middleware.ts` para proteger `/admin/*` e `/api/*` no servidor

## Dados de Teste

Para desenvolvimento, inserir em `TAB_USUARIO`:

```sql
INSERT INTO TAB_USUARIO (nome, email, senha, ativo)
VALUES ('Admin', 'admin@example.com', 'admin123', true);

INSERT INTO TAB_USUARIO (nome, email, senha, ativo)
VALUES ('Lucas', 'lucas@veiculos.com.br', 'lucas@lucas', true);
```

## Arquivos de Referencia

- **Login:** `src/app/api/login/route.ts`
- **Admin Layout:** `src/app/admin/layout.tsx`
- **Page Entrar:** `src/app/entrar/page.tsx`
- **Auditoria helper:** `src/lib/auditoria.ts`
