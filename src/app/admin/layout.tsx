'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import './admin-sidebar.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [nome, setNome] = useState('');
  const [iniciais, setIniciais] = useState('AD');
  const [carregando, setCarregando] = useState(true);
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [tarefasVencidas, setTarefasVencidas] = useState<number | null>(null);
  const [sidebarAberta, setSidebarAberta] = useState(false);

  useEffect(() => { setSidebarAberta(false); }, [pathname]);

  useEffect(() => {
    const logado = sessionStorage.getItem('admin_logado');
    const nomeSalvo = sessionStorage.getItem('admin_nome') || 'Admin';

    if (!logado) {
      router.push('/entrar');
      return;
    }

    setNome(nomeSalvo);

    const partes = nomeSalvo.trim().split(' ');
    const ini =
      partes.length >= 2
        ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
        : nomeSalvo.slice(0, 2).toUpperCase();
    setIniciais(ini);

    setCarregando(false);

    fetch('/api/leads/dashboard')
      .then(r => r.json())
      .then(data => {
        setTotalLeads(data.totalLeads ?? 0);
        setTarefasVencidas(data.tarefasVencidas ?? 0);
      })
      .catch(() => {});
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem('admin_logado');
    sessionStorage.removeItem('admin_nome');
    document.cookie = 'admin_usuario=; Max-Age=0; path=/';
    router.push('/entrar');
  }

  function tituloPagina(): string {
    if (pathname === '/admin/dashboard') return 'Dashboard';
    if (pathname.startsWith('/admin/carros/editar')) return 'Editar Carro';
    if (pathname.startsWith('/admin/carros/novo')) return 'Novo Carro';
    if (pathname.startsWith('/admin/carros')) return 'Gerenciar Carros';
    if (pathname.startsWith('/admin/configuracoes/cores')) return 'Configurações — Cores';
    if (pathname.startsWith('/admin/configuracoes/midia')) return 'Configurações — Mídia';
    if (pathname.startsWith('/admin/configuracoes/textos')) return 'Configurações — Textos';
    if (pathname.startsWith('/admin/configuracoes/auditoria')) return 'Configurações — Auditoria';
    if (pathname.startsWith('/admin/configuracoes')) return 'Configurações';
    if (pathname.startsWith('/admin/crm/leads') && pathname.length > '/admin/crm/leads'.length) return 'Detalhe do Lead';
    if (pathname.startsWith('/admin/crm/leads')) return 'Leads';
    if (pathname.startsWith('/admin/crm/funil')) return 'Funil de Vendas';
    if (pathname.startsWith('/admin/crm/tarefas')) return 'Tarefas';
    if (pathname.startsWith('/admin/crm/relatorios')) return 'Relatórios';
    if (pathname.startsWith('/admin/crm/configuracoes')) return 'Config. CRM';
    if (pathname.startsWith('/admin/crm')) return 'Dashboard CRM';
    return 'Admin';
  }

  function ativo(href: string): string {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' ? 'navItem ativo' : 'navItem';
    }
    return pathname.startsWith(href) ? 'navItem ativo' : 'navItem';
  }

  if (carregando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000', color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
        Carregando...
      </div>
    );
  }

  return (
    <div className={`adminWrapper${sidebarAberta ? ' sidebarAberta' : ''}`}>

      {/* Backdrop mobile */}
      <div className="backdrop" onClick={() => setSidebarAberta(false)} />

      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">

        <div className="sidebarLogo">
          <div className="sidebarLogoNome">LUCAS VEÍCULOS</div>
          <div className="sidebarLogoSub">Painel Admin</div>
        </div>

        <div className="navSecao">Principal</div>
        <Link href="/admin/dashboard" className={ativo('/admin/dashboard')}>
          <span className="navItemIcone">⊞</span>
          Dashboard
        </Link>

        <div className="navSecao">Gestão</div>
        <Link href="/admin/carros" className={ativo('/admin/carros')}>
          <span className="navItemIcone">🚗</span>
          Carros
        </Link>
        <Link href="/admin/configuracoes" className={ativo('/admin/configuracoes')}>
          <span className="navItemIcone">⚙</span>
          Configurações
        </Link>

        <div className="navSecao">CRM</div>
        <Link href="/admin/crm" className={ativo('/admin/crm')}>
          <span className="navItemIcone">⊡</span>
          Dashboard CRM
        </Link>
        <Link href="/admin/crm/leads" className={ativo('/admin/crm/leads')}>
          <span className="navItemIcone">👥</span>
          Leads
          {totalLeads !== null && totalLeads > 0 && <span className="navBadgeDourado">{totalLeads}</span>}
        </Link>
        <Link href="/admin/crm/funil" className={ativo('/admin/crm/funil')}>
          <span className="navItemIcone">⬡</span>
          Funil de Vendas
        </Link>
        <Link href="/admin/crm/tarefas" className={ativo('/admin/crm/tarefas')}>
          <span className="navItemIcone">☑</span>
          Tarefas
          {tarefasVencidas !== null && tarefasVencidas > 0 && <span className="navBadge">{tarefasVencidas}</span>}
        </Link>
        <Link href="/admin/crm/relatorios" className={ativo('/admin/crm/relatorios')}>
          <span className="navItemIcone">📊</span>
          Relatórios
        </Link>
        <Link href="/admin/crm/configuracoes" className={ativo('/admin/crm/configuracoes')}>
          <span className="navItemIcone">⚙</span>
          Config. CRM
        </Link>

        <div className="sidebarRodape">
          <div className="sidebarAvatar">{iniciais}</div>
          <div>
            <div className="sidebarNome">{nome}</div>
            <div className="sidebarCargo">Administrador</div>
          </div>
        </div>

      </aside>

      {/* ══ ÁREA PRINCIPAL ══ */}
      <div className="adminMain">

        <div className="adminTopbar">
          <button
            className="btnHamburger"
            onClick={() => setSidebarAberta(p => !p)}
            aria-label="Menu"
          >
            <span className="hamburguerIcone">
              <span />
              <span />
              <span />
            </span>
          </button>
          <div style={{ flex: 1 }}>
            <div className="adminTopbarTitulo">{tituloPagina()}</div>
            <div className="adminTopbarSub">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
          <div className="adminTopbarAcoes">
            <button className="btnSair" onClick={handleLogout}>Sair</button>
          </div>
        </div>

        <div className="adminConteudo">
          {children}
        </div>

      </div>
    </div>
  );
}
