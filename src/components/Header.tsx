'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Header.css';

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();

  function toggleMenu() {
    setMenuAberto(!menuAberto);
  }

  return (
    <header 
      className="header-container" 
      style={{ 
        position: 'relative',
        width: '100%',
        background: '#1a1a1a', 
        boxShadow: 'none',
        zIndex: 100 
      }}
    >
      {/* Header principal */}
      <div className="headerContent">
        <div className="logoArea">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <h1 className="logo">LUCAS VEÍCULOS</h1>
            <p className="slogan">Há 10 anos realizando sonhos</p>
          </Link>
        </div>
        
        <button onClick={toggleMenu} className="menuButton" aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}>
          {menuAberto ? (
            <span className="closeIcon">×</span>
          ) : (
            <>
              <span className="hamburgerLine"></span>
              <span className="hamburgerLine"></span>
              <span className="hamburgerLine"></span>
            </>
          )}
        </button>

        <nav className="menuDesktop">
          <Link href="/" className={`menuLink ${pathname === '/' ? 'menuLinkAtivo' : ''}`}>Home</Link>
          <Link href="/empresa" className={`menuLink ${pathname === '/empresa' ? 'menuLinkAtivo' : ''}`}>Empresa</Link>
          <Link href="/estoque" className={`menuLink ${pathname === '/estoque' ? 'menuLinkAtivo' : ''}`}>Estoque</Link>
          <Link href="/financiamento" className={`menuLink ${pathname === '/financiamento' ? 'menuLinkAtivo' : ''}`}>Financiamento</Link>
          <Link href="/servicos" className={`menuLink ${pathname === '/servicos' ? 'menuLinkAtivo' : ''}`}>Serviços</Link>
          <Link href="/contato" className={`menuLink ${pathname === '/contato' ? 'menuLinkAtivo' : ''}`}>Contato</Link>
          <Link href="/entrar" className="menuLink menuLinkAdmin">🔒 Área de Administrador</Link>
        </nav>
      </div>

      {menuAberto && (
        <div className="menuMobile">
          <Link href="/" className="menuMobileLink" onClick={toggleMenu}>Home</Link>
          <Link href="/empresa" className="menuMobileLink" onClick={toggleMenu}>Empresa</Link>
          <Link href="/estoque" className="menuMobileLink" onClick={toggleMenu}>Estoque</Link>
          <Link href="/financiamento" className="menuMobileLink" onClick={toggleMenu}>Financiamento</Link>
          <Link href="/servicos" className="menuMobileLink" onClick={toggleMenu}>Serviços</Link>
          <Link href="/contato" className="menuMobileLink" onClick={toggleMenu}>Contato</Link>
          <Link href="/entrar" className="menuMobileLink" onClick={toggleMenu}>🔒 Área de Administrador</Link>
        </div>
      )}

    </header>
  );
}
