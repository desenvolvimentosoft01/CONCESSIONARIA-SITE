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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-titulo">Painel Administrativo</h1>
        <button onClick={handleLogout} className="dashboard-botao-sair">
          Sair
        </button>
      </div>

      <main className="dashboard-main">
        <h2 className="dashboard-boas-vindas">Bem-vindo, {nome}!</h2>
        
        <div className="dashboard-grid">
          <Link href="/admin/carros" className="dashboard-card">
            <h3 className="dashboard-card-titulo">🚗 Carros</h3>
            <p className="dashboard-card-descricao">Gerenciar carros da loja</p>
          </Link>

          <Link href="/admin/midia" className="dashboard-card">
            <h3 className="dashboard-card-titulo">📁 Mídia</h3>
            <p className="dashboard-card-descricao">Gerenciar imagens e vídeos do site</p>
          </Link>

          <Link href="/admin/auditoria" className="dashboard-card">
            <h3 className="dashboard-card-titulo">📋 Auditoria</h3>
            <p className="dashboard-card-descricao">Visualizar histórico de alterações</p>
          </Link>

          <Link href="/admin/personalizacao" className="dashboard-card">
            <h3 className="dashboard-card-titulo">🎨 Personalização</h3>
            <p className="dashboard-card-descricao">Alterar cores e tema do site</p>
          </Link>
        </div>
      </main>
    </div>
  );
}