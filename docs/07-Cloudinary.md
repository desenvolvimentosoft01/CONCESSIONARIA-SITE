# 🖼️ Cloudinary - Gerenciamento de Imagens

## Visão Geral

Cloudinary é um serviço cloud para armazenar, transformar e servir imagens. Neste projeto:

- **Imagens de veículos:** Múltiplas por carro
- **Mídia por seção:** Carousels, galerias, banners
- **Logos/Assets:** Identidade visual da loja

## Credenciais

**Arquivo:** `.env.local`

```bash
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

**Obter em:** https://dashboard.cloudinary.com/settings/

## Setup

### 1. Criar Conta

https://cloudinary.com/ → Sign up (gratuito até 25 GB)

### 2. Copiar Credenciais

Dashboard → Settings → API Keys

### 3. Estrutura de Pastas

Organizar imagens em:

```
concessionaria/
  ├── carros/        # Veículos
  ├── midia/         # Seções (carousel, galeria, etc)
  └── assets/        # Logos, ícones
```

Recomendado criar manualmente no Cloudinary ou via upload.

## Integração no Código

### Arquivo: `src/lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file, folder = 'concessionaria') {
  const result = await cloudinary.uploader.upload(file, {
    folder: folder,
    resource_type: 'auto',
  });
  return result;
}

export async function deleteImage(publicId) {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

export function getImageUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
}
```

## Upload de Imagens

### Fluxo Geral

```
1. Cliente seleciona arquivo
   ↓
2. POST /api/upload (multipart)
   ↓
3. Servidor chama cloudinary.uploader.upload()
   ↓
4. Recebe URL + publicId
   ↓
5. Salva em TAB_CARRO_IMAGEM ou TAB_MIDIA
   ↓
6. Retorna URL ao cliente
   ↓
7. Frontend exibe imagem
```

### Endpoint: `POST /api/upload`

**Arquivo:** `src/app/api/upload/route.ts`

```typescript
import { uploadImage } from '@/lib/cloudinary';
import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const id_carro = formData.get('id_carro');

    // Upload Cloudinary
    const buffer = await file.arrayBuffer();
    const result = await uploadImage(Buffer.from(buffer), 'concessionaria/carros');

    // Salvar referência no banco
    await query(
      `INSERT INTO TAB_CARRO_IMAGEM (id_carro, url_cloudinary, ordem) 
       VALUES ($1, $2, (SELECT COALESCE(MAX(ordem), -1) + 1 FROM TAB_CARRO_IMAGEM WHERE id_carro = $1))`,
      [id_carro, result.secure_url]
    );

    // Auditoria
    await registrarAuditoria({
      tabela: 'TAB_CARRO_IMAGEM',
      acao: 'INSERT',
      dados_novos: { id_carro, url: result.secure_url },
      usuario: getClientInfo(req),
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Deletar Imagens

### Fluxo

```
1. Admin clica delete na imagem
   ↓
2. DELETE /api/upload { publicId, id_imagem }
   ↓
3. Servidor chama cloudinary.uploader.destroy(publicId)
   ↓
4. Remove TAB_CARRO_IMAGEM
   ↓
5. Registra auditoria
   ↓
6. Frontend atualiza galeria
```

### Endpoint: `DELETE /api/upload`

```typescript
import { deleteImage } from '@/lib/cloudinary';

export async function DELETE(req: NextRequest) {
  try {
    const { publicId, id_imagem } = await req.json();

    // Deletar Cloudinary
    await deleteImage(publicId);

    // Deletar referência banco
    await query('DELETE FROM TAB_CARRO_IMAGEM WHERE id = $1', [id_imagem]);

    // Auditoria
    await registrarAuditoria({
      tabela: 'TAB_CARRO_IMAGEM',
      acao: 'DELETE',
      dados_antigos: { id: id_imagem, publicId },
      usuario: getClientInfo(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Transformações de Imagem

Cloudinary permite transformar imagens na URL (sem processar no servidor):

### Exemplos

```javascript
// Redimensionar + crop
cloudinary.url('concessionaria/carros/img123', {
  width: 800,
  height: 600,
  crop: 'fill'
});
// https://res.cloudinary.com/.../w_800,h_600,c_fill/concessionaria/carros/img123.jpg

// Qualidade automática
cloudinary.url('image', {
  quality: 'auto',
  fetch_format: 'auto'
});

// Thumbnail
cloudinary.url('image', {
  width: 200,
  height: 200,
  crop: 'thumb',
  gravity: 'face'
});
```

### No HTML/React

```jsx
import Image from 'next/image';

export default function CarroGaleria({ imagens }) {
  return (
    <div className="galeria">
      {imagens.map((img, i) => (
        <Image
          key={i}
          src={img.url_cloudinary}
          alt={`Foto ${i + 1}`}
          width={400}
          height={300}
          unoptimized  // Cloudinary já otimiza
        />
      ))}
    </div>
  );
}
```

## Organizando Arquivos

### Estrutura Recomendada

```
concessionaria/
├── carros/
│   ├── [id_carro]/
│   │   ├── frente.jpg
│   │   ├── lateral.jpg
│   │   └── interior.jpg
├── midia/
│   ├── carousel_home/
│   ├── galeria_empresa/
│   └── servicos/
└── assets/
    ├── logo.png
    ├── favicon.ico
    └── banner.jpg
```

### Implementar Estrutura

Via dashboard Cloudinary:

1. Create Folder → `concessionaria`
2. Create Folder → `concessionaria/carros`
3. Etc...

Ou via CLI (se tiver Cloudinary CLI instalado):

```bash
npm install -g cloudinary-cli

cloudinary folders create concessionaria
cloudinary folders create concessionaria/carros
```

## Limites e Pricing

### Plano Gratuito

- 25 GB storage
- 25 GB bandwidth/mês
- Unlimited transformations
- 10 mil imagens

### Upgrade

Se ultrapassar:
- Storage: $0.02/GB/mês
- Bandwidth: $0.04/GB/mês
- Imagens extras: $0.001 cada

**Tip:** Use `quality: 'auto'` e `fetch_format: 'auto'` para economizar bandwidth.

## Troubleshooting

### Erro: "Unauthorized" ao fazer upload

Verificar:
- `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` corretos
- `.env.local` recarregado (reiniciar servidor)

### Imagem não aparece

- Verificar URL em `TAB_CARRO_IMAGEM` está correta
- Testar URL direto no navegador
- Verificar permissões de acesso no Cloudinary

### Upload lento

- Comprimir imagens antes (< 2 MB ideal)
- Usar `quality: 'auto'` no cliente
- Considerar CDN regional

## Referência

- **Docs oficial:** https://cloudinary.com/documentation
- **SDK Node.js:** https://github.com/cloudinary/cloudinary_npm
- **Transformations:** https://cloudinary.com/documentation/transformation_reference
