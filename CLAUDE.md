# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Build for production
npm run start    # Start production server
```

No test runner or linter is configured in this project.

## Environment Variables

Required in `.env.local`:

```
DATABASE_URL=           # PostgreSQL connection string
CLOUDINARY_CLOUD_NAME=  # Cloudinary cloud name
CLOUDINARY_API_KEY=     # Cloudinary API key
CLOUDINARY_API_SECRET=  # Cloudinary API secret
EMAIL_USER=             # Gmail address for sending contact emails
EMAIL_PASS=             # Gmail app password
```

## Architecture Overview

This is a **Next.js 14 (App Router)** site for a car dealership ("Lucas Veículos", Araçatuba/SP). The project is split into a public-facing site and an admin panel.

### Database

PostgreSQL accessed via `src/lib/db.ts` using a connection pool (`pg`). All queries go through the exported `query()` helper. Table naming convention is `TAB_*`:

- `TAB_CARRO` — vehicle records
- `TAB_CARRO_IMAGEM` — vehicle images (supports multiple per car, ordered by `ordem`)
- `TAB_MIDIA` — site media (images/videos per section, e.g. carousels)
- `TAB_CONFIGURACAO` — key-value store for theme colors and site settings
- `TAB_USUARIO` — admin users (plain-text password comparison — not hashed)
- `TAB_AUDITORIA` — audit log of CREATE/UPDATE/DELETE actions

### Authentication

Session-based via `sessionStorage` on the client. On login (`/api/login`), the server sets a `admin_usuario` cookie (non-httpOnly) for audit tracking, and the client stores `admin_logado` / `admin_nome` in `sessionStorage`. The `src/app/admin/layout.tsx` client component redirects to `/entrar` if `sessionStorage.admin_logado` is missing.

**Note:** Passwords in `TAB_USUARIO` are stored and compared as plain text. The `bcryptjs` package is installed but not used.

### Audit System

`src/lib/auditoria.ts` provides `registrarAuditoria()` and `getClientInfo()`. Every API route that mutates data should call both. `getClientInfo()` reads the admin username from the `admin_usuario` cookie.

### Theme/Personalization

`TAB_CONFIGURACAO` stores CSS color values keyed by names like `cor_primaria`, `cor_header`, etc. `src/components/TemaProvider.tsx` fetches these on mount and injects a `<style>` block with CSS variables and class overrides. This runs client-side on every page load via the root layout.

### Image & Media Management

- **Vehicle images**: uploaded via `src/app/api/upload/route.tsx` → Cloudinary (`src/lib/cloudinary.ts`). Multiple images per car stored in `TAB_CARRO_IMAGEM` with `ordem` field.
- **Site media**: managed via `src/app/api/midia/` routes — images/videos assigned to named `secao` slots (e.g. carousels, about page gallery).
- Cloudinary is configured in `src/lib/cloudinary.ts` and used server-side only.

### Public Routes

| Route | Purpose |
|---|---|
| `/` | Home page |
| `/estoque` | Vehicle inventory listing |
| `/carro/[id]` | Individual vehicle detail page |
| `/empresa` | About page |
| `/servicos` | Services page |
| `/contato` | Contact form (sends email via Nodemailer/Gmail) |

### Admin Routes (`/admin/*`)

All protected by the `sessionStorage` check in `src/app/admin/layout.tsx`.

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Main panel with links to sub-sections |
| `/admin/carros` | List/delete vehicles |
| `/admin/carros/novo` | Add new vehicle |
| `/admin/carros/editar/[id]` | Edit existing vehicle |
| `/admin/midia` | Manage site media per section |
| `/admin/personalizacao` | Edit theme colors (saved to `TAB_CONFIGURACAO`) |
| `/admin/auditoria` | View audit log |

### API Routes (`/api/*`)

All API routes are Next.js Route Handlers in `src/app/api/`. They return JSON and use the `query()` helper directly — no ORM.

### Styling

CSS Modules via co-located `.css` files (e.g. `admin-carros.css` next to `page.tsx`). Global styles in `src/app/globals.css`. Class names are in Portuguese (e.g. `.botaoDetalhes`, `.cardPreco`). No Tailwind or CSS-in-JS except the dynamic `<style>` injection in `TemaProvider`.
