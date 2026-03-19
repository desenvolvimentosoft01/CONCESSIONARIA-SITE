'use client';

import { useEffect } from 'react';

export default function StyleReset() {
  useEffect(() => {
    // For\u00e7a o reset de estilos quando o componente monta
    document.body.style.overflow = 'auto';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    return () => {
      // Cleanup quando desmonta
      document.body.style.overflow = 'auto';
    };
  }, []);

  return null;
}
