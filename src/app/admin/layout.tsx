'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Verifica se está logado
    const logado = sessionStorage.getItem('admin_logado');
    
    // Se não estiver logado, redireciona para login
    if (!logado) {
      router.push('/entrar');
    }
  }, [router]);

  return <>{children}</>;
}