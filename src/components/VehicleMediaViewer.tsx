'use client';
import React, { useState, useEffect, useRef } from 'react';
import FadeIn from './FadeIn';

export default function VehicleMediaViewer({ midias }: { midias: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      proximaMidia();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  const proximaMidia = () => {
    setCurrentIndex((prev) => (prev + 1 === midias.length ? 0 : prev + 1));
  };

  const midiaAtual = midias[currentIndex];

  return (
    <div 
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <FadeIn 
          key={currentIndex} 
          y={0} 
          duration={0.8}
          style={{ width: '100%', height: '100%' }}
        >
          {midiaAtual.tipo === 'video' ? (
            <video
              ref={videoRef}
              src={midiaAtual.url}
              autoPlay
              muted
              loop
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={midiaAtual.url}
              alt="Veículo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </FadeIn>
      </div>

      {/* Controles Nav */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
        {midias.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? '40px' : '10px',
              height: '10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: idx === currentIndex ? '#c5a059' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}