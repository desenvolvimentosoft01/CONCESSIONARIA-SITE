'use client';

import { useState } from 'react';

interface DiferencialCardProps {
  titulo: string;
  descricao: string;
  icone: string;
}

export default function DiferencialCard({ titulo, descricao, icone }: DiferencialCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: `1px solid ${isHovered ? '#c5a059' : '#333333'}`,
        borderRadius: '12px',
        padding: '40px 30px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 8px 32px rgba(197, 160, 89, 0.15)' : 'none',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icone}</div>
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
        {titulo}
      </h3>
      <p style={{ fontSize: '14px', color: '#aaaaaa', lineHeight: 1.6 }}>{descricao}</p>
    </div>
  );
}
