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
    return <div className="dashboardCarregando">Carregando...</div>;
  }

  return (
    <div className="dashboardContainer">

      {/* ── HEADER ── */}
      <header className="dashboardHeader">
        <h1 className="dashboardTitulo">PAINEL ADMINISTRATIVO</h1>
        <button onClick={handleLogout} className="dashboardBotaoSair">
          Sair
        </button>
      </header>

      <main className="dashboardMain">
        <p className="dashboardBoasVindas">Bem-vindo, {nome}</p>

        {/* ── MÉTRICAS ── */}
        <div className="dashboardMetricas">
          <div className="metricaCard">
            <div className="metricaLabel">Veículos Cadastrados</div>
            <div className="metricaValor">24</div>
            <div className="metricaSub">8 vendidos este mês</div>
          </div>
          <div className="metricaCard">
            <div className="metricaLabel">Leads no CRM</div>
            <div className="metricaValor metricaVlorDourado">12</div>
            <div className="metricaSub">+3 esta semana</div>
          </div>
          <div className="metricaCard">
            <div className="metricaLabel">Tarefas Vencidas</div>
            <div className="metricaValor metricaValorVermelho">3</div>
            <div className="metricaSub">Requerem atenção</div>
          </div>
        </div>

        {/* ── TÍTULO ACESSO RÁPIDO ── */}
        <div className="acessoRapidoTitulo">Acesso Rápido</div>

        {/* ── GRID DE CARDS ── */}
        <div className="dashboardGrid">

          <Link href="/admin/carros" className="dashboardCard">
            <div className="dashboardCardIcone">🚗</div>
            <h3 className="dashboardCardTitulo">Carros</h3>
            <p className="dashboardCardDescricao">Gerenciar veículos do estoque</p>
          </Link>

          <Link href="/admin/midia" className="dashboardCard">
            <div className="dashboardCardIcone">📁</div>
            <h3 className="dashboardCardTitulo">Mídia</h3>
            <p className="dashboardCardDescricao">Imagens e vídeos do site</p>
          </Link>

          <Link href="/admin/auditoria" className="dashboardCard">
            <div className="dashboardCardIcone">📋</div>
            <h3 className="dashboardCardTitulo">Auditoria</h3>
            <p className="dashboardCardDescricao">Histórico de alterações</p>
          </Link>

          <Link href="/admin/personalizacao" className="dashboardCard dashboardCardDestaque">
            <div className="dashboardCardIcone">🎨</div>
            <h3 className="dashboardCardTitulo dashboardCardTituloDourado">Personalização</h3>
            <p className="dashboardCardDescricao">Cores e tema do site</p>
          </Link>

          <Link href="/admin/crm" className="dashboardCard dashboardCardDestaque">
            <div className="dashboardCardIcone">👥</div>
            <h3 className="dashboardCardTitulo dashboardCardTituloDourado">CRM</h3>
            <p className="dashboardCardDescricao">Leads, funil e follow-ups</p>
          </Link>

          <Link href="/admin/financiamento" className="dashboardCard">
            <div className="dashboardCardIcone">💰</div>
            <h3 className="dashboardCardTitulo">Financiamento</h3>
            <p className="dashboardCardDescricao">Conteúdo da página</p>
          </Link>

        </div>
      </main>
    </div>
  );
}
