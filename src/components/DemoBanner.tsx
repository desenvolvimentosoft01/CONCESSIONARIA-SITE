'use client';

import { useEffect, useState } from 'react';

interface DemoStatus {
  demo: boolean;
  diasRestantes: number;
  expirado: boolean;
  dataExpiracao: string | null;
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

  const texto = status.expirado
    ? 'Demo expirado'
    : `${status.diasRestantes} dia${status.diasRestantes !== 1 ? 's' : ''} restante${status.diasRestantes !== 1 ? 's' : ''}`;

  if (variant === 'public') {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: status.expirado ? 'rgba(220,53,69,0.95)' : 'rgba(10,10,10,0.95)',
        borderTop: `1px solid ${status.expirado ? '#dc3545' : 'rgba(197,160,89,0.4)'}`,
        color: status.expirado ? '#fff' : '#c5a059',
        fontSize: 12,
        fontWeight: 700,
        textAlign: 'center',
        padding: '8px 16px',
        letterSpacing: '0.4px',
        fontFamily: 'Inter, sans-serif',
        backdropFilter: 'blur(4px)',
      }}>
        ⚠ AMBIENTE DE DEMONSTRAÇÃO
        {' · '}
        {texto}
        {status.dataExpiracao && !status.expirado && ` · expira em ${status.dataExpiracao}`}
      </div>
    );
  }

  return (
    <div style={{
      background: status.expirado ? 'rgba(220,53,69,0.15)' : 'rgba(197,160,89,0.1)',
      borderBottom: `1px solid ${status.expirado ? 'rgba(220,53,69,0.4)' : 'rgba(197,160,89,0.25)'}`,
      color: status.expirado ? '#dc3545' : '#c5a059',
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
      <span>{texto}{status.dataExpiracao && !status.expirado && ` — expira em ${status.dataExpiracao}`}</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span style={{ fontWeight: 400, opacity: 0.8 }}>dados fictícios · não afeta sistemas reais</span>
    </div>
  );
}
