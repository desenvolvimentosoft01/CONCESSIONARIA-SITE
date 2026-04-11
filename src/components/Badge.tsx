'use client';
import React from 'react';

interface BadgeProps {
  text: string;
  type?: 'primary' | 'secondary' | 'outline';
}

export default function Badge({ text, type = 'primary' }: BadgeProps) {
  const styles = {
    primary: { backgroundColor: '#c5a059', color: '#fff' },
    secondary: { backgroundColor: '#1a1a1a', color: '#fff' },
    outline: { backgroundColor: 'transparent', border: '1px solid #ddd', color: '#666' }
  };

  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      ...styles[type]
    }}>
      {text}
    </span>
  );
}