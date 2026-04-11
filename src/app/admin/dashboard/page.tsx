'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const logado = sessionStorage.getItem('admin_logado');
    const nomeSalvo = sessionStorage.getItem('admin_nome');
    
    if (!logado) {
      router.push('/entrar');
    } else {
      setNome(nomeSalvo || 'Admin');
      setCarregando(false);
    }
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem('admin_logado');
    sessionStorage.removeItem('admin_nome');
    router.push('/entrar');
  }

  if (carregando) {
    return (
      <div className="dashboard-carregando">
        Carregando...
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#fff', padding: '40px 20px' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>PAINEL ADMINISTRATIVO</h1>
        <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sair
        </button>
      </div>

      <main>
        <h2 style={{ fontSize: '18px', color: '#c5a059', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>Bem-vindo, {nome}</h2>
        
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          <Link href="/admin/carros" className="dashboard-card" style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '4px', border: '1px solid #333', transition: 'all 0.3s' }}>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>🚗 Carros</h3>
            <p style={{ color: '#888', fontSize: '14px' }}>Gerenciar carros da loja</p>
          </Link>

          <Link href="/admin/midia" className="dashboard-card" style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '4px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>📁 Mídia</h3>
            <p style={{ color: '#888', fontSize: '14px' }}>Gerenciar imagens e vídeos do site</p>
          </Link>

          <Link href="/admin/auditoria" className="dashboard-card" style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '4px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '10px' }}>📋 Auditoria</h3>
            <p style={{ color: '#888', fontSize: '14px' }}>Visualizar histórico de alterações</p>
          </Link>

          <Link href="/admin/personalizacao" className="dashboard-card" style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '4px', border: '1px solid #c5a059' }}>
            <h3 style={{ color: '#c5a059', marginBottom: '10px' }}>🎨 Personalização</h3>
            <p style={{ color: '#888', fontSize: '14px' }}>Alterar cores e tema do site</p>
          </Link>
        </div>
      </main>
    </div>
  );
}