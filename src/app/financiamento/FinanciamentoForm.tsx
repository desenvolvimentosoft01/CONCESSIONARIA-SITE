'use client';

import { useState } from 'react';
import Toast from '@/components/Toast';

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  valorVeiculo: string;
  mensagem: string;
}

type FormErros = Partial<Record<keyof FormData, string>>;
type Feedback = { status: 'idle' } | { status: 'sucesso'; mensagem: string } | { status: 'erro'; mensagem: string };

export default function FinanciamentoForm() {
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    valorVeiculo: '',
    mensagem: '',
  });

  const [erros, setErros] = useState<FormErros>({});
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ status: 'idle' });

  function validar(dados: FormData): FormErros {
    const errors: FormErros = {};

    if (!dados.nome.trim()) errors.nome = 'Nome é obrigatório';
    if (!dados.email.trim()) errors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) errors.email = 'Email inválido';
    if (!dados.telefone.trim()) errors.telefone = 'Telefone é obrigatório';
    if (!dados.mensagem.trim()) errors.mensagem = 'Mensagem é obrigatória';

    return errors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (erros[name as keyof FormData]) {
      setErros((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback({ status: 'idle' });

    const validacaoErros = validar(form);
    if (Object.keys(validacaoErros).length > 0) {
      setErros(validacaoErros);
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch('/api/financiamento-contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.trim(),
          valorVeiculo: form.valorVeiculo.trim() || undefined,
          mensagem: form.mensagem.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.sucesso) {
        setFeedback({ status: 'sucesso', mensagem: 'Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve.' });
        setForm({ nome: '', email: '', telefone: '', valorVeiculo: '', mensagem: '' });
        setErros({});
      } else {
        setFeedback({ status: 'erro', mensagem: data.erro || 'Erro ao enviar solicitação' });
      }
    } catch (error) {
      console.error('Erro ao enviar:', error);
      setFeedback({ status: 'erro', mensagem: 'Erro ao conectar com o servidor. Tente novamente.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {feedback.status !== 'idle' && (
        <Toast
          mensagem={feedback.mensagem}
          tipo={feedback.status === 'sucesso' ? 'sucesso' : 'erro'}
          onClose={() => setFeedback({ status: 'idle' })}
        />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Nome */}
        <div>
          <label
            htmlFor="nome"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Nome Completo *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Seu nome"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              border: `2px solid ${erros.nome ? '#ff4444' : '#333333'}`,
              backgroundColor: '#262626',
              color: '#ffffff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              if (!erros.nome) (e.target as HTMLInputElement).style.borderColor = '#c5a059';
            }}
            onBlur={(e) => {
              if (!erros.nome) (e.target as HTMLInputElement).style.borderColor = '#333333';
            }}
          />
          {erros.nome && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px' }}>{erros.nome}</p>}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              border: `2px solid ${erros.email ? '#ff4444' : '#333333'}`,
              backgroundColor: '#262626',
              color: '#ffffff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              if (!erros.email) (e.target as HTMLInputElement).style.borderColor = '#c5a059';
            }}
            onBlur={(e) => {
              if (!erros.email) (e.target as HTMLInputElement).style.borderColor = '#333333';
            }}
          />
          {erros.email && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px' }}>{erros.email}</p>}
        </div>

        {/* Telefone */}
        <div>
          <label
            htmlFor="telefone"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Telefone / WhatsApp *
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            placeholder="(18) 99999-9999"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              border: `2px solid ${erros.telefone ? '#ff4444' : '#333333'}`,
              backgroundColor: '#262626',
              color: '#ffffff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              if (!erros.telefone) (e.target as HTMLInputElement).style.borderColor = '#c5a059';
            }}
            onBlur={(e) => {
              if (!erros.telefone) (e.target as HTMLInputElement).style.borderColor = '#333333';
            }}
          />
          {erros.telefone && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px' }}>{erros.telefone}</p>}
        </div>

        {/* Valor do Veículo (Opcional) */}
        <div>
          <label
            htmlFor="valorVeiculo"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Valor do Veículo (Opcional)
          </label>
          <input
            type="text"
            id="valorVeiculo"
            name="valorVeiculo"
            value={form.valorVeiculo}
            onChange={handleChange}
            placeholder="R$ 50.000,00"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              border: '2px solid #333333',
              backgroundColor: '#262626',
              color: '#ffffff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#c5a059';
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = '#333333';
            }}
          />
        </div>

        {/* Mensagem */}
        <div>
          <label
            htmlFor="mensagem"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Mensagem / Preferências *
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            value={form.mensagem}
            onChange={handleChange}
            placeholder="Conte-nos mais sobre seus planos de financiamento, preferências de parcelas, etc."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              border: `2px solid ${erros.mensagem ? '#ff4444' : '#333333'}`,
              backgroundColor: '#262626',
              color: '#ffffff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              minHeight: '120px',
              resize: 'vertical',
            }}
            onFocus={(e) => {
              if (!erros.mensagem) (e.target as HTMLTextAreaElement).style.borderColor = '#c5a059';
            }}
            onBlur={(e) => {
              if (!erros.mensagem) (e.target as HTMLTextAreaElement).style.borderColor = '#333333';
            }}
          />
          {erros.mensagem && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px' }}>{erros.mensagem}</p>}
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={enviando}
          style={{
            padding: '14px 40px',
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            backgroundColor: enviando ? '#666666' : '#c5a059',
            color: enviando ? '#999999' : '#000000',
            border: 'none',
            borderRadius: '6px',
            cursor: enviando ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '10px',
          }}
          onMouseEnter={(e) => {
            if (!enviando) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d4af6a';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(197, 160, 89, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!enviando) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#c5a059';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }
          }}
        >
          {enviando ? '⏳ Enviando...' : '📤 Enviar Solicitação'}
        </button>
      </form>
    </>
  );
}
