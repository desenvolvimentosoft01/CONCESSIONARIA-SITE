'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './entrar.css';

export default function EntrarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('admin_logado', 'true');
        sessionStorage.setItem('admin_nome', data.nome);
        router.push(redirect);
      } else {
        setErro(data.erro || 'Email ou senha inválidos');
      }
    } catch (error) {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="entrar-container" style={{ background: '#000000', backgroundImage: 'none', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="login-card" style={{ width: '100%', maxWidth: '450px' }}>
        <Link href="/" style={{ color: '#c5a059', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', marginBottom: '30px', display: 'inline-block' }}>← Voltar para o site</Link>
        
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' }}>LUCAS VEÍCULOS</h1>
        <h2 style={{ color: '#c5a059', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px', fontWeight: '700' }}>Área do Administrador</h2>
        
        {erro && <div className="erro" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #dc3545', fontSize: '14px' }}>{erro}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="campo" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#eee', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              style={{ width: '100%' }}
              required
              disabled={carregando}
            />
          </div>
          
          <div className="campo" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', color: '#eee', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="admin-input"
              style={{ width: '100%' }}
              required
              disabled={carregando}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-premium"
            style={{ width: '100%', padding: '15px' }}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}