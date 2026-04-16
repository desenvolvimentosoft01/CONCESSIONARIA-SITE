'use client';

import { useState } from 'react';

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

type FormErros = Partial<Record<keyof FormData, string>>;

type Feedback =
  | { status: 'idle' }
  | { status: 'sucesso'; mensagem: string }
  | { status: 'erro'; mensagem: string };

const ASSUNTO_OPCOES = [
  'Compra de veículo',
  'Financiamento',
  'Troca / Avaliação',
  'Dúvidas',
  'Suporte',
  'Outros',
];

const FORM_VAZIO: FormData = { nome: '', email: '', telefone: '', assunto: '', mensagem: '' };

function mascaraTelefone(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums.length ? `(${nums}` : '';
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validar(dados: FormData): FormErros {
  const erros: FormErros = {};
  if (!dados.nome.trim()) erros.nome = 'Nome obrigatório.';
  if (!dados.email.trim()) {
    erros.email = 'E-mail obrigatório.';
  } else if (!validarEmail(dados.email)) {
    erros.email = 'Informe um e-mail válido.';
  }
  if (!dados.telefone.trim()) {
    erros.telefone = 'Telefone obrigatório.';
  } else if (dados.telefone.replace(/\D/g, '').length < 10) {
    erros.telefone = 'Informe um telefone válido.';
  }
  if (!dados.assunto) erros.assunto = 'Selecione um assunto.';
  if (!dados.mensagem.trim()) {
    erros.mensagem = 'Mensagem obrigatória.';
  } else if (dados.mensagem.trim().length < 10) {
    erros.mensagem = 'A mensagem deve ter pelo menos 10 caracteres.';
  }
  return erros;
}

export default function ContatoForm() {
  const [form, setForm] = useState<FormData>(FORM_VAZIO);
  const [erros, setErros] = useState<FormErros>({});
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ status: 'idle' });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    const novoValor = name === 'telefone' ? mascaraTelefone(value) : value;
    setForm(prev => ({ ...prev, [name]: novoValor }));
    if (erros[name as keyof FormData]) {
      setErros(prev => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const novosErros = validar(form);
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setEnviando(true);
    setFeedback({ status: 'idle' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.sucesso) {
        setFeedback({ status: 'sucesso', mensagem: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' });
        setForm(FORM_VAZIO);
        setErros({});
      } else {
        setFeedback({ status: 'erro', mensagem: data.erro || 'Erro ao enviar mensagem. Tente novamente.' });
      }
    } catch {
      setFeedback({ status: 'erro', mensagem: 'Erro de conexão. Verifique sua internet e tente novamente.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulário de contato">
      {feedback.status === 'sucesso' && (
        <div className="mensagemSucesso" role="alert">
          ✅ {feedback.mensagem}
        </div>
      )}
      {feedback.status === 'erro' && (
        <div className="mensagemErro" role="alert">
          ❌ {feedback.mensagem}
        </div>
      )}

      <div className="campo">
        <label className="label" htmlFor="nome">Nome Completo *</label>
        <input
          id="nome"
          name="nome"
          type="text"
          className={`input${erros.nome ? ' inputErro' : ''}`}
          value={form.nome}
          onChange={handleChange}
          placeholder="Seu nome completo"
          autoComplete="name"
          aria-required="true"
          aria-describedby={erros.nome ? 'erro-nome' : undefined}
          aria-invalid={!!erros.nome}
        />
        {erros.nome && <span id="erro-nome" className="erroCampo">{erros.nome}</span>}
      </div>

      <div className="campo">
        <label className="label" htmlFor="email">E-mail *</label>
        <input
          id="email"
          name="email"
          type="email"
          className={`input${erros.email ? ' inputErro' : ''}`}
          value={form.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          autoComplete="email"
          aria-required="true"
          aria-describedby={erros.email ? 'erro-email' : undefined}
          aria-invalid={!!erros.email}
        />
        {erros.email && <span id="erro-email" className="erroCampo">{erros.email}</span>}
      </div>

      <div className="campo">
        <label className="label" htmlFor="telefone">Telefone / WhatsApp *</label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          className={`input${erros.telefone ? ' inputErro' : ''}`}
          value={form.telefone}
          onChange={handleChange}
          placeholder="(18) 99999-9999"
          autoComplete="tel"
          inputMode="numeric"
          aria-required="true"
          aria-describedby={erros.telefone ? 'erro-telefone' : undefined}
          aria-invalid={!!erros.telefone}
        />
        {erros.telefone && <span id="erro-telefone" className="erroCampo">{erros.telefone}</span>}
      </div>

      <div className="campo">
        <label className="label" htmlFor="assunto">Assunto *</label>
        <select
          id="assunto"
          name="assunto"
          className={`select${erros.assunto ? ' inputErro' : ''}`}
          value={form.assunto}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={erros.assunto ? 'erro-assunto' : undefined}
          aria-invalid={!!erros.assunto}
        >
          <option value="">Selecione um assunto...</option>
          {ASSUNTO_OPCOES.map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
        {erros.assunto && <span id="erro-assunto" className="erroCampo">{erros.assunto}</span>}
      </div>

      <div className="campo">
        <label className="label" htmlFor="mensagem">Mensagem *</label>
        <textarea
          id="mensagem"
          name="mensagem"
          className={`textarea${erros.mensagem ? ' inputErro' : ''}`}
          value={form.mensagem}
          onChange={handleChange}
          placeholder="Descreva como podemos ajudá-lo..."
          rows={5}
          aria-required="true"
          aria-describedby={erros.mensagem ? 'erro-mensagem' : undefined}
          aria-invalid={!!erros.mensagem}
        />
        {erros.mensagem && <span id="erro-mensagem" className="erroCampo">{erros.mensagem}</span>}
      </div>

      <button
        type="submit"
        className={enviando ? 'botaoEnviarDisabled' : 'botaoEnviar'}
        disabled={enviando}
        aria-busy={enviando}
      >
        {enviando ? '⏳ Enviando...' : '📨 Enviar Mensagem'}
      </button>
    </form>
  );
}
