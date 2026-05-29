'use client';

import { useEffect, useState } from 'react';

interface DemoStatus {
  demo: boolean;
  diasRestantes: number;
  expirado: boolean;
  dataExpiracao: string | null;
}

const whatsapp = process.env.NEXT_PUBLIC_DEMO_AGENCIA_WHATSAPP ?? '';
const email    = process.env.NEXT_PUBLIC_DEMO_AGENCIA_EMAIL    ?? '';

function TelaExpirado() {
  const linkWhats = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi a demonstração do site e tenho interesse.')}`
    : null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>🔒</div>

      <h1 style={{
        fontSize: 26,
        fontWeight: 900,
        color: '#fff',
        marginBottom: 12,
        letterSpacing: '-0.5px',
      }}>
        Demonstração Encerrada
      </h1>

      <p style={{ fontSize: 14, color: '#666', maxWidth: 400, lineHeight: 1.7, marginBottom: 36 }}>
        O período de 7 dias de demonstração foi concluído.
        Gostou do que viu? Entre em contato para adquirir seu site.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        {linkWhats && (
          <a
            href={linkWhats}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              background: '#25d366',
              color: '#fff',
              textDecoration: 'none',
              padding: '14px 24px',
              borderRadius: 6,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Falar no WhatsApp
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}?subject=Interesse no site de concessionária`}
            style={{
              display: 'block',
              background: 'transparent',
              color: '#c5a059',
              border: '1px solid rgba(197,160,89,0.4)',
              textDecoration: 'none',
              padding: '14px 24px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Enviar E-mail
          </a>
        )}
      </div>

      {email && (
        <p style={{ marginTop: 24, fontSize: 12, color: '#444' }}>{email}</p>
      )}
    </div>
  );
}

export default function DemoBanner({ variant = 'admin' }: { variant?: 'admin' | 'public' }) {
  const [status, setStatus] = useState<DemoStatus | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return;
    fetch('/api/demo/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status?.demo) return null;

  if (status.expirado) return <TelaExpirado />;

  const texto = `${status.diasRestantes} dia${status.diasRestantes !== 1 ? 's' : ''} restante${status.diasRestantes !== 1 ? 's' : ''}`;

  if (variant === 'public') {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(10,10,10,0.95)',
        borderTop: '1px solid rgba(197,160,89,0.4)',
        color: '#c5a059',
        fontSize: 12,
        fontWeight: 700,
        textAlign: 'center',
        padding: '8px 16px',
        letterSpacing: '0.4px',
        fontFamily: 'Inter, sans-serif',
        backdropFilter: 'blur(4px)',
      }}>
        ⚠ AMBIENTE DE DEMONSTRAÇÃO · {texto}
        {status.dataExpiracao && ` · expira em ${status.dataExpiracao}`}
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(197,160,89,0.1)',
      borderBottom: '1px solid rgba(197,160,89,0.25)',
      color: '#c5a059',
      fontSize: 12,
      fontWeight: 700,
      textAlign: 'center',
      padding: '9px 16px',
      letterSpacing: '0.4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    }}>
      <span>⚠ MODO DEMO</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span>{texto}{status.dataExpiracao && ` — expira em ${status.dataExpiracao}`}</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span style={{ fontWeight: 400, opacity: 0.8 }}>dados fictícios · não afeta sistemas reais</span>
    </div>
  );
}
