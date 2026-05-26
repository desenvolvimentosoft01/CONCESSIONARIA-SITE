'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './crm-configuracoes.css';

interface Etapa {
  id: number;
  nome: string;
  cor: string;
  ordem: number;
}

export default function ConfiguracoesCrmPage() {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [editando, setEditando] = useState<Record<number, { nome: string; cor: string }>>({});
  const [salvando, setSalvando] = useState<Record<number, boolean>>({});
  const [erros, setErros] = useState<Record<number, string>>({});

  const [novaAberta, setNovaAberta] = useState(false);
  const [novaNome, setNovaNome] = useState('');
  const [novaCor, setNovaCor] = useState('#5b9cf6');
  const [criando, setCriando] = useState(false);
  const [erroNova, setErroNova] = useState('');

  useEffect(() => { carregarEtapas(); }, []);

  async function carregarEtapas() {
    try {
      const res = await fetch('/api/leads/etapas');
      const data = await res.json();
      const lista: Etapa[] = Array.isArray(data) ? data : [];
      setEtapas(lista);
      const inicial: Record<number, { nome: string; cor: string }> = {};
      lista.forEach((e: Etapa) => { inicial[e.id] = { nome: e.nome, cor: e.cor }; });
      setEditando(inicial);
    } finally {
      setCarregando(false);
    }
  }

  function atualizar(id: number, campo: 'nome' | 'cor', valor: string) {
    setEditando(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
  }

  async function salvar(id: number) {
    setSalvando(prev => ({ ...prev, [id]: true }));
    setErros(prev => ({ ...prev, [id]: '' }));
    try {
      const res = await fetch(`/api/leads/etapas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editando[id]),
      });
      if (!res.ok) {
        const d = await res.json();
        setErros(prev => ({ ...prev, [id]: d.erro || 'Erro ao salvar.' }));
      } else {
        await carregarEtapas();
      }
    } finally {
      setSalvando(prev => ({ ...prev, [id]: false }));
    }
  }

  async function excluir(id: number, nome: string) {
    if (!confirm(`Excluir a etapa "${nome}"? Leads nessa etapa impedirão a exclusão.`)) return;
    setErros(prev => ({ ...prev, [id]: '' }));
    const res = await fetch(`/api/leads/etapas/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json();
      setErros(prev => ({ ...prev, [id]: d.erro || 'Erro ao excluir.' }));
    } else {
      await carregarEtapas();
    }
  }

  async function criarEtapa() {
    if (!novaNome.trim()) { setErroNova('Nome obrigatório.'); return; }
    setCriando(true);
    setErroNova('');
    try {
      const res = await fetch('/api/leads/etapas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novaNome.trim(), cor: novaCor }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErroNova(d.erro || 'Erro ao criar etapa.');
      } else {
        setNovaAberta(false);
        setNovaNome('');
        setNovaCor('#5b9cf6');
        await carregarEtapas();
      }
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="paginaConfiguracoes">
      <div className="cabecalho">
        <h1 className="tituloPagina">Configurações do CRM</h1>
        <Link href="/admin/dashboard" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>← Painel</Link>
      </div>

      <nav className="navCrm">
        <Link href="/admin/crm" className="linkNav">Dashboard</Link>
        <Link href="/admin/crm/leads" className="linkNav">Leads</Link>
        <Link href="/admin/crm/funil" className="linkNav">Funil</Link>
        <Link href="/admin/crm/tarefas" className="linkNav">Tarefas</Link>
        <Link href="/admin/crm/relatorios" className="linkNav">Relatórios</Link>
        <Link href="/admin/crm/configuracoes" className="linkNav linkNavAtivo">Configurações</Link>
      </nav>

      <div className="grade">
        {/* Etapas do Funil */}
        <div className="card">
          <div className="cabecalhoCard">
            <div className="cardTitulo" style={{ marginBottom: 0 }}>Etapas do Funil</div>
            <button
              className="botaoNovaEtapa"
              onClick={() => { setNovaAberta(p => !p); setErroNova(''); }}
            >
              {novaAberta ? '✕ Cancelar' : '+ Nova Etapa'}
            </button>
          </div>

          {novaAberta && (
            <div className="formularioNovaEtapa">
              <input
                className="inputEtapa"
                placeholder="Nome da etapa"
                value={novaNome}
                onChange={e => setNovaNome(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && criarEtapa()}
              />
              <input
                type="color"
                className="inputCor"
                value={novaCor}
                onChange={e => setNovaCor(e.target.value)}
              />
              <button className="botaoSalvar" onClick={criarEtapa} disabled={criando}>
                {criando ? '...' : 'Criar'}
              </button>
              {erroNova && <span className="erroEtapa">{erroNova}</span>}
            </div>
          )}

          <div className="listaEtapas">
            {carregando ? (
              <div style={{ color: '#444', fontSize: 13, padding: '12px 0' }}>Carregando...</div>
            ) : etapas.map(e => (
              <div key={e.id} className="itemEtapa">
                <div className="pontoCor" style={{ backgroundColor: editando[e.id]?.cor ?? e.cor }} />
                <input
                  className="inputEtapa"
                  value={editando[e.id]?.nome ?? e.nome}
                  onChange={ev => atualizar(e.id, 'nome', ev.target.value)}
                />
                <input
                  type="color"
                  className="inputCor"
                  value={editando[e.id]?.cor ?? e.cor}
                  onChange={ev => atualizar(e.id, 'cor', ev.target.value)}
                />
                <button
                  className="botaoSalvar"
                  onClick={() => salvar(e.id)}
                  disabled={salvando[e.id]}
                >
                  {salvando[e.id] ? '...' : 'Salvar'}
                </button>
                <button className="botaoExcluir" onClick={() => excluir(e.id, e.nome)}>
                  Excluir
                </button>
                {erros[e.id] && <span className="erroEtapa">{erros[e.id]}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="separadorColunaLateral">
          <div className="card">
            <div className="cardTitulo">Tipos de Interação</div>
            <div className="listaTipos">
              <span className="badgeTipo">📞 Ligação</span>
              <span className="badgeTipo">💬 WhatsApp</span>
              <span className="badgeTipo">📧 E-mail</span>
              <span className="badgeTipo">🏢 Visita</span>
              <span className="badgeTipo">📝 Observação</span>
            </div>
          </div>

          <div className="card">
            <div className="cardTitulo">Captura Automática</div>
            <div className="listaCaptura">
              <div className="itemCaptura">
                <span className="nomeCaptura">Formulário /contato</span>
                <span className="statusAtivo">Ativo</span>
              </div>
              <div className="itemCaptura">
                <span className="nomeCaptura">Formulário /financiamento</span>
                <span className="statusAtivo">Ativo</span>
              </div>
              <div className="itemCaptura">
                <span className="nomeCaptura">Etapa inicial</span>
                <span style={{ fontSize: 12, color: '#555' }}>Novo (etapa_id: 1)</span>
              </div>
              <div className="itemCaptura">
                <span className="nomeCaptura">Auditoria</span>
                <span className="statusAtivo">Registrando</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
