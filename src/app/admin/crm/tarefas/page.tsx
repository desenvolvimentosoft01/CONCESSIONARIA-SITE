'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './crm-tarefas.css';

interface Tarefa {
  id: number;
  lead_id: number;
  lead_nome: string;
  tipo?: string;
  descricao: string;
  prazo?: string;
  status: string;
}

interface Lead {
  id: number;
  nome: string;
}

function formatarData(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
}

function isVencida(prazo?: string): boolean {
  if (!prazo) return false;
  return new Date(prazo + 'T23:59:59') < new Date();
}

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novaT, setNovaT] = useState({ lead_id: '', tipo: '', descricao: '', prazo: '' });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const leadsRes = await fetch('/api/leads?limit=500');
    const leadsData = await leadsRes.json();
    const todosLeads: Lead[] = leadsData.leads ?? [];
    setLeads(todosLeads);

    const todasTarefas: Tarefa[] = [];
    await Promise.all(
      todosLeads.map(async (l: Lead) => {
        const r = await fetch(`/api/leads/${l.id}/tarefas`);
        const t = await r.json();
        (t as Tarefa[]).forEach(tar => { todasTarefas.push({ ...tar, lead_nome: l.nome }); });
      })
    );

    todasTarefas.sort((a, b) => {
      if (!a.prazo && !b.prazo) return 0;
      if (!a.prazo) return 1;
      if (!b.prazo) return -1;
      return a.prazo.localeCompare(b.prazo);
    });

    setTarefas(todasTarefas);
    setCarregando(false);
  }

  async function alterarStatus(tarefa: Tarefa) {
    const novoStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
    await fetch(`/api/leads/${tarefa.lead_id}/tarefas`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tarefa_id: tarefa.id, status: novoStatus }),
    });
    setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: novoStatus } : t));
  }

  async function criarTarefa() {
    if (!novaT.lead_id || !novaT.descricao) return;
    setSalvando(true);
    await fetch(`/api/leads/${novaT.lead_id}/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: novaT.tipo || undefined,
        descricao: novaT.descricao,
        prazo: novaT.prazo || undefined,
      }),
    });
    setNovaT({ lead_id: '', tipo: '', descricao: '', prazo: '' });
    setSalvando(false);
    await carregar();
  }

  const pendentes = tarefas.filter(t => t.status === 'pendente');
  const vencidas = pendentes.filter(t => isVencida(t.prazo));
  const proximas = pendentes.filter(t => !isVencida(t.prazo));
  const concluidas = tarefas.filter(t => t.status === 'concluida');

  const renderTarefa = (t: Tarefa) => (
    <div key={t.id} className={`itemTarefa ${t.status === 'concluida' ? 'tarefaConcluida' : ''}`}>
      <input type="checkbox" className="checkboxTarefa" checked={t.status === 'concluida'} onChange={() => alterarStatus(t)} />
      <div style={{ flex: 1 }}>
        <div className="textoTarefa">{t.descricao}</div>
        <Link href={`/admin/crm/leads/${t.lead_id}`} className="leadLink">{t.lead_nome}</Link>
      </div>
      {t.prazo && (
        <div className={`prazoTarefa ${isVencida(t.prazo) && t.status !== 'concluida' ? 'prazoVencido' : ''}`}>
          {formatarData(t.prazo)}
        </div>
      )}
    </div>
  );

  return (
    <div className="paginaTarefas">
      <div className="cabecalho">
        <h1 className="tituloPagina">
          Tarefas
          {vencidas.length > 0 && <span className="badgeVencidas">{vencidas.length} vencidas</span>}
        </h1>
        <Link href="/admin/dashboard" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>← Painel</Link>
      </div>

      <nav className="navCrm">
        <Link href="/admin/crm" className="linkNav">Dashboard</Link>
        <Link href="/admin/crm/leads" className="linkNav">Leads</Link>
        <Link href="/admin/crm/funil" className="linkNav">Funil</Link>
        <Link href="/admin/crm/tarefas" className="linkNav linkNavAtivo">Tarefas</Link>
        <Link href="/admin/crm/relatorios" className="linkNav">Relatórios</Link>
        <Link href="/admin/crm/configuracoes" className="linkNav">Configurações</Link>
      </nav>

      {carregando ? (
        <div style={{ color: '#444', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : (
        <div className="grade">
          <div className="coluna">
            <div className="tituloColuna">Vencidas ({vencidas.length})</div>
            <div className="listaTarefas">
              {vencidas.length === 0 ? <div className="semTarefas">Nenhuma tarefa vencida</div> : vencidas.map(renderTarefa)}
            </div>
            <div style={{ marginTop: 24 }}>
              <div className="tituloColuna">Concluídas ({concluidas.length})</div>
              <div className="listaTarefas">
                {concluidas.slice(0, 5).map(renderTarefa)}
                {concluidas.length === 0 && <div className="semTarefas">Nenhuma concluída</div>}
              </div>
            </div>
          </div>

          <div className="coluna">
            <div className="tituloColuna">Próximas ({proximas.length})</div>
            <div className="listaTarefas">
              {proximas.length === 0 ? <div className="semTarefas">Nenhuma tarefa pendente</div> : proximas.map(renderTarefa)}
            </div>
          </div>
        </div>
      )}

      {/* Formulário nova tarefa */}
      <div className="formularioNovaTarefa">
        <div className="tituloForm">+ Nova Tarefa</div>
        <div className="gridForm">
          <select className="select" value={novaT.lead_id} onChange={e => setNovaT(p => ({ ...p, lead_id: e.target.value }))}>
            <option value="">Selecionar lead...</option>
            {leads.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
          <select className="select" value={novaT.tipo} onChange={e => setNovaT(p => ({ ...p, tipo: e.target.value }))}>
            <option value="">Tipo</option>
            <option value="Ligação">Ligação</option>
            <option value="Visita">Visita</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Proposta">Proposta</option>
          </select>
        </div>
        <input className="input" placeholder="Descrição da tarefa..." value={novaT.descricao} onChange={e => setNovaT(p => ({ ...p, descricao: e.target.value }))} />
        <div className="gridForm" style={{ marginTop: 10 }}>
          <input className="input" type="date" value={novaT.prazo} onChange={e => setNovaT(p => ({ ...p, prazo: e.target.value }))} />
          <div />
        </div>
        <div className="acoesForm">
          <button className="botaoSalvar" onClick={criarTarefa} disabled={salvando || !novaT.lead_id || !novaT.descricao}>
            {salvando ? 'Criando...' : 'Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
}
