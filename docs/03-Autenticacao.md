# 🔐 Autenticação e Sessão

## Fluxo de Login

```
1. Usuário acessa /entrar
   ↓
2. Preenche usuario + senha
   ↓
3. POST /api/login { usuario, senha }
   ↓
4. Servidor valida contra TAB_USUARIO (plain text)
   ↓
5. Se OK:
   - Set cookie: admin_usuario = "nome_usuario"
   - Response: { success: true, usuario: "..." }
   ↓
6. Cliente recebe resposta
   ↓
7. Armazena em sessionStorage:
   - admin_logado = "true"
   - admin_nome = "Usuario Name"
   ↓
8. Redireciona para /admin/dashboard
```

## Componentes

### 1. Cookie (Servidor)

**Arquivo:** `src/app/api/login/route.ts`

```typescript
// Ao fazer login com sucesso:
const response = NextResponse.json({ success: true, usuario });

response.cookies.set('admin_usuario', usuario, {
  httpOnly: false,  // Acessível via JS
  path: '/',
  maxAge: 24 * 60 * 60  // 24 horas
});

return response;
```

**Usado para:** Rastreamento de auditoria (saber quem fez o quê).

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

**Propriedades stored:**
- `admin_logado` = `"true"` (string)
- `admin_nome` = `"Lucas Silva"` (nome do usuário logado)

## Proteção de Rotas Admin

### Client-side (Primária)

Componente `AdminLayout` em `src/app/admin/layout.tsx`:

```typescript
if (!sessionStorage.getItem('admin_logado')) {
  router.push('/entrar');
}
```

### Server-side (API)

Em cada rota que modifica dados, validar o cookie:

```typescript
export async function POST(req: NextRequest) {
  const adminUsuario = req.cookies.get('admin_usuario')?.value;
  
  if (!adminUsuario) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    );
  }
  
  // Continuar com a operação
}
```

## Logout

**Arquivo:** `src/app/api/logout/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_usuario');
  return response;
}
```

**Cliente:**

```typescript
const logout = async () => {
  await fetch('/api/logout', { method: 'POST' });
  sessionStorage.removeItem('admin_logado');
  sessionStorage.removeItem('admin_nome');
  router.push('/entrar');
};
```

## Segurança

### ⚠️ Problemas Atuais

1. **Senhas em plain text** — Armazenadas sem hash em `TAB_USUARIO`
2. **SessionStorage** — Acessível via XSS
3. **Cookie não httpOnly** — Acessível via JavaScript
4. **Sem CSRF protection** — Sem tokens CSRF

### 🔧 Melhorias Recomendadas

Para produção:

1. **Hash de senhas:**
```bash
npm install bcryptjs
```

2. **Session segura:**
- Usar JWT com HttpOnly cookie + SameSite
- Ou session store no servidor (Redis)

3. **CSRF tokens:**
- Implementar via middleware

## Dados de Teste

Para desenvolvimento, inserir em `TAB_USUARIO`:

```sql
INSERT INTO TAB_USUARIO (usuario, senha, email, ativo) 
VALUES ('admin', 'admin123', 'admin@example.com', true);

INSERT INTO TAB_USUARIO (usuario, senha, email, ativo) 
VALUES ('lucas', 'lucas@lucas', 'lucas@veiculos.com.br', true);
```

## Arquivo de Referência

- **Login:** `src/app/api/login/route.ts`
- **Logout:** `src/app/api/logout/route.ts`
- **Admin Layout:** `src/app/admin/layout.tsx`
- **Page Entrar:** `src/app/entrar/page.tsx`
