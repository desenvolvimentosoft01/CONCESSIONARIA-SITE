'use client';

import { useState } from 'react';

interface CarImageProps {
  src: string | null;
  alt: string;
  style?: React.CSSProperties;
}

export default function CarImage({ src, alt, style }: CarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div style={{
        height: '200px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        color: '#ccc',
        ...style
      }}>
        🚗
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      style={style}
      onError={() => setError(true)}
    />
  );
}