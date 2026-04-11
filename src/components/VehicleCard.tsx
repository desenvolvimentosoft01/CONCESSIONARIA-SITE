'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Badge from './Badge';
import FadeIn from './FadeIn';

interface VehicleCardProps {
  carro: any;
  index: number;
}

export default function VehicleCard({ carro, index }: VehicleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <FadeIn 
      delay={index * 100}
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.6)' : '0 10px 20px rgba(0,0,0,0.2)',
        border: isHovered ? '1px solid #c5a059' : '1px solid #333',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.21, 0.47, 0.32, 0.98)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/carro/${carro.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', overflow: 'hidden', height: '240px' }}>
          <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 2, display: 'flex', gap: '5px' }}>
            {carro.ano >= 2024 && <Badge text="Novo" />}
            {carro.destaque && <Badge text="Destaque" type="secondary" />}
          </div>
          
          <Image 
            src={carro.primeira_imagem || '/placeholder-car.jpg'} 
            alt={carro.modelo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ 
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 1.2s cubic-bezier(0.21, 0.47, 0.32, 0.98)'
            }}
          />
        </div>

        <div style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#c5a059', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>{carro.marca}</span>
              <h3 style={{ margin: '5px 0', fontSize: '20px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>{carro.modelo}</h3>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', background: '#333', padding: '4px 8px', borderRadius: '4px' }}>
              {carro.ano}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', fontSize: '13px', color: '#aaa' }}>
            <span>{Number(carro.quilometragem).toLocaleString()} km</span>
            <span>•</span>
            <span>{carro.combustivel || 'Flex'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #333', paddingTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Preço à vista</span>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#c5a059' }}>
                R$ {Number(carro.preco).toLocaleString('pt-BR')}
              </span>
            </div>
            
            <div 
              style={{ 
                color: '#c5a059', 
                fontSize: '20px',
                transform: isHovered ? 'translateX(5px)' : 'none',
                transition: 'transform 0.3s ease'
              }}
            >
              →
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}