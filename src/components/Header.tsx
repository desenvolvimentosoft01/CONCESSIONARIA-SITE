'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Header.css';

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [aviso, setAviso] = useState(false);
  const pathname = usePathname();

  function toggleMenu() {
    setMenuAberto(!menuAberto);
  }

  const handleFinanciamento = (e: React.MouseEvent) => {
    e.preventDefault();
    setAviso(true);
  };

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
          <a 
            href="#" 
            onClick={handleFinanciamento} 
            className={`menuLink ${pathname === '/financiamento' ? 'menuLinkAtivo' : ''}`}
          >
            Financiamento
          </a>
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
          <a 
            href="#" 
            className="menuMobileLink" 
            onClick={(e) => { handleFinanciamento(e); toggleMenu(); }}
          >
            Financiamento
          </a>
          <Link href="/servicos" className="menuMobileLink" onClick={toggleMenu}>Serviços</Link>
          <Link href="/contato" className="menuMobileLink" onClick={toggleMenu}>Contato</Link>
          <Link href="/entrar" className="menuMobileLink" onClick={toggleMenu}>🔒 Área de Administrador</Link>
        </div>
      )}

      {/* Modal de Aviso Premium - Estilo TCar */}
      {aviso && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            padding: '20px'
          }}
          onClick={() => setAviso(false)}
        >
          <div 
            style={{
              backgroundColor: '#1a1a1a',
              padding: '50px 40px',
              borderRadius: '4px',
              border: '1px solid #c5a059',
              textAlign: 'center',
              maxWidth: '450px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
              animation: 'fadeInUp 0.4s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
             <span style={{ fontSize: '50px', display: 'block', marginBottom: '25px' }}>🚧</span>
             <h2 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>EM DESENVOLVIMENTO</h2>
             <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>Estamos preparando uma plataforma de financiamento exclusiva para você realizar sua próxima conquista com as melhores taxas do mercado.</p>
             <button 
               onClick={() => setAviso(false)}
               className="btn-premium"
               style={{ padding: '12px 50px', fontSize: '12px' }}
             >
               ENTENDI
             </button>
          </div>
        </div>
      )}
    </header>
  );
}
