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
    <div className="entrar-container">
      <div className="loginBox">
        <Link href="/" className="voltarHome">← Voltar</Link>
        
        <h1 className="titulo">LUCAS VEÍCULOS</h1>
        <h2 className="subtitulo">Área do Administrador</h2>
        
        {erro && <div className="erro">{erro}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              disabled={carregando}
            />
          </div>
          
          <div className="campo">
            <label className="label">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input"
              required
              disabled={carregando}
            />
          </div>
          
          <button 
            type="submit" 
            className={carregando ? 'botaoCarregando' : 'botao'}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}