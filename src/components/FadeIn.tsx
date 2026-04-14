'use client';
import React, { useState, useEffect } from 'react';

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
}

export default function FadeIn({ 
  children, 
  delay = 0, 
  y = 40, 
  duration = 0.8, 
  className = "",
  style = {},
  ...rest
}: FadeInProps) {
  const [MotionDiv, setMotionDiv] = useState<any>(null);

  useEffect(() => {
    // Importação dinâmica para evitar erros de build se a lib sumir
    import('framer-motion').then((mod) => {
      setMotionDiv(() => mod.motion.div);
    }).catch(() => {
      console.warn('Framer Motion não encontrado. Renderizando sem animações.');
    });
  }, []);

  if (!MotionDiv) {
    return <div className={className} style={style} {...rest}>{children}</div>;
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: duration, 
        delay: delay / 1000, 
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </MotionDiv>
  );
}