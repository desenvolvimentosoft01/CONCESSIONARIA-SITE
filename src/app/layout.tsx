import './globals.css';
import { Suspense } from 'react';
import TemaProvider from '@/components/TemaProvider';
import type { Metadata } from 'next';
import { Inter, Montserrat, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'LUCAS VEÍCULOS - Há 10 anos realizando sonhos',
  description: 'Concessionária especializada na comercialização de veículos novos e seminovos. Multimarcas nacionais e importados.',
  keywords: 'veículos, carros, seminovos, concessionária, Araçatuba',
};

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '600', '700', '800'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700', '800', '900'] });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-playfair' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${jakarta.className} ${playfair.variable}`} style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ backgroundColor: '#fcfcfc', color: '#1a1a1a', margin: 0, overflowX: 'hidden', fontFamily: 'var(--font-jakarta), sans-serif' }}>
        <TemaProvider />
        <Suspense fallback={<div className="loader-container">Carregando...</div>}>
          {children}
        </Suspense>

        <WhatsAppButton />
      </body>
    </html>
  );
}