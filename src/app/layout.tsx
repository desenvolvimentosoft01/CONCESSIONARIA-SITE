import './globals.css';
import { Suspense } from 'react';
import TemaProvider from '@/components/TemaProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LUCAS VEÍCULOS - Há 10 anos realizando sonhos',
  description: 'Concessionária especializada na comercialização de veículos novos e seminovos. Multimarcas nacionais e importados.',
  keywords: 'veículos, carros, seminovos, concessionária, Araçatuba',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <TemaProvider />
        <Suspense fallback={<div>Carregando...</div>}>
          {children}
        </Suspense>

        {/* Botão flutuante WhatsApp */}
        <a
          href="https://wa.me/5518996692266?text=Olá, gostaria de mais informações"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-flutuante"
          aria-label="Falar no WhatsApp"
        >
          <svg viewBox="0 0 32 32" width="32" height="32" fill="white">
            <path d="M16 0C7.164 0 0 7.164 0 16c0 2.825.738 5.488 2.031 7.794L0 32l8.394-2.031C10.7 31.262 13.363 32 16 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.333c-2.456 0-4.794-.669-6.794-1.831l-.488-.294-5.056 1.225 1.225-5.056-.294-.488C3.336 20.794 2.667 18.456 2.667 16 2.667 8.644 8.644 2.667 16 2.667S29.333 8.644 29.333 16 23.356 29.333 16 29.333zm7.294-9.956c-.4-.2-2.369-1.169-2.738-1.3-.369-.131-.638-.2-.906.2-.269.4-1.038 1.3-1.275 1.569-.238.269-.475.3-.875.1-.4-.2-1.688-.619-3.213-1.981-1.188-1.056-1.988-2.363-2.219-2.763-.231-.4-.025-.619.175-.819.181-.181.4-.475.6-.713.2-.238.269-.4.4-.669.131-.269.069-.5-.031-.7-.1-.2-.906-2.181-1.244-2.988-.331-.788-.669-.681-.906-.694-.238-.013-.506-.013-.775-.013s-.713.1-1.081.5c-.369.4-1.406 1.375-1.406 3.356s1.438 3.894 1.638 4.163c.2.269 2.825 4.313 6.844 6.05.956.413 1.7.656 2.281.844.956.3 1.825.256 2.513.156.769-.113 2.369-.969 2.7-1.906.331-.938.331-1.738.231-1.906-.1-.169-.369-.269-.769-.469z" />
          </svg>
        </a>
      </body>
    </html>
  );
}