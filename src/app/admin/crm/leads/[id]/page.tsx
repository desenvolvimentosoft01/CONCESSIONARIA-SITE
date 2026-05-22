'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import './crm-lead-detalhe.css';

interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  mensagem?: string;
  origem: string;
  etapa_id: number;
  etapa_nome: string;
  etapa_cor: string;
  carro_id?: number;
  carro_modelo?: string;
  valor_estimado?: number;
  criado_em: string;
}

interface Etapa {
  etapa_id: number;
  etapa: string;
  cor: string;
}

interface Interacao {
  id: number;
  tipo: string;
  texto: string;
  usuario: string;
  criado_em: string;
}

interface Tarefa {
  id: number;
  tipo?: string;
  descricao: string;
  prazo?: string;
  status: string;
}

const ICONES_TIPO: Record<string, string> = {
  ligacao: '📞', whatsapp: '💬', email: '📧', visita: '🏢', observacao: '📝',
};

function iniciais(nome: string): string {
  const p = nome.trim().split(' ');
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

function formatarData(d: string): string {
  return new Date(d).toLocaleDateString('pt-BR');
}

function formatarDataHora(d: string): string {
  return new Date(d).toLocaleString('pt-BR');
}

export default function LeadDetalhePage() {
  const params = useParams();
  const id = params?.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [toast, setToast] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [valorEstimado, setValorEstimado] = useState('');
  const [salvandoValor, setSalvandoValor] = useState(false);

  const [novaInteracao, setNovaInteracao] = useState({ tipo: 'observacao', texto: '' });
  const [registrando, setRegistrando] = useState(false);

  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({ tipo: '', descricao: '', prazo: '' });
  const [criandoTarefa, setCriandoTarefa] = useState(false);

  const mostrarToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const carregar = useCallback(async () => {
    const [leadRes, interRes, tarRes, etapasRes] = await Promise.all([
      fetch(`/api/leads/${id}`),
      fetch(`/api/leads/${id}/interacoes`),
      fetch(`/api/leads/${id}/tarefas`),
      fetch('/api/leads/dashboard'),
    ]);
    const [l, i, t, e] = await Promise.all([leadRes.json(), interRes.json(), tarRes.json(), etapasRes.json()]);
    setLead(l);
    setInteracoes(i);
    setTarefas(t);
    setEtapas(e.leadsPorEtapa ?? []);
    setValorEstimado(l.valor_estimado?.toString() ?? '');
    setCarregando(false);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function mudarEtapa(etapa_id: string) {
    await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa_id: parseInt(etapa_id) }),
    });
    await carregar();
    mostrarToast('Etapa atualizada!');
  }

  async function salvarValor() {
    setSalvandoValor(true);
    await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor_estimado: valorEstimado ? parseFloat(valorEstimado) : null }),
    });
    setSalvandoValor(false);
    mostrarToast('Valor salvo!');
  }

  async function registrarInteracao() {
    if (!novaInteracao.texto.trim()) return;
    setRegistrando(true);
    await fetch(`/api/leads/${id}/interacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaInteracao),
    });
    setNovaInteracao({ tipo: 'observacao', texto: '' });
    setRegistrando(false);
    await carregar();
  }

  async function criarTarefa() {
    if (!novaTarefa.descricao.trim()) return;
    setCriandoTarefa(true);
    await fetch(`/api/leads/${id}/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: novaTarefa.tipo || undefined,
        descricao: novaTarefa.descricao,
        prazo: novaTarefa.prazo || undefined,
      }),
    });
    setNovaTarefa({ tipo: '', descricao: '', prazo: '' });
    setMostrarFormTarefa(false);
    setCriandoTarefa(false);
    await carregar();
    mostrarToast('Tarefa criada!');
  }

  async function concluirTarefa(tarefa_id: number, status: string) {
    const novoStatus = status === 'concluida' ? 'pendente' : 'concluida';
    await fetch(`/api/leads/${id}/tarefas`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tarefa_id, status: novoStatus }),
    });
    setTarefas(prev => prev.map(t => t.id === tarefa_id ? { ...t, status: novoStatus } : t));
  }

  if (carregando || !lead) {
    return <div style={{ background: '#000', minHeight: '100vh', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>Carregando...</div>;
  }

  return (
    <div className="paginaDetalhe">
      <div className="cabecalho">
        <div className="infoLead">
          <div className="avatarGrande" style={{ backgroundColor: lead.etapa_cor ?? '#333' }}>
            {iniciais(lead.nome)}
          </div>
          <div>
            <div className="nomePrincipal">{lead.nome}</div>
            <div className="badgesLead">
              <span className="badgeEtapa" style={{ backgroundColor: lead.etapa_cor ?? '#333' }}>
                {lead.etapa_nome ?? 'Novo'}
              </span>
              <span className="badgeOrigem">{lead.origem}</span>
            </div>
          </div>
        </div>
        <Link href="/admin/crm/leads" className="botaoVoltar">← Voltar para Leads</Link>
      </div>

      <div className="gradeDetalhe">
        {/* Dados do Lead */}
        <div className="card">
          <div className="cardTitulo">Dados do Lead</div>
          <div className="linhaInfo"><span className="labelInfo">Email</span><span className="valorInfo">{lead.email}</span></div>
          {lead.telefone && <div className="linhaInfo"><span className="labelInfo">Telefone</span><span className="valorInfo">{lead.telefone}</span></div>}
          <div className="linhaInfo"><span className="labelInfo">Data de entrada</span><span className="valorInfo">{formatarData(lead.criado_em)}</span></div>
          {lead.mensagem && (
            <div className="linhaInfo">
              <span className="labelInfo">Mensagem original</span>
              <div className="mensagemOriginal">{lead.mensagem}</div>
            </div>
          )}
        </div>

        {/* Negociação */}
        <div className="card">
          <div className="cardTitulo">Negociação</div>
          <select
            className="selectEtapa"
            value={lead.etapa_id}
            onChange={e => mudarEtapa(e.target.value)}
          >
            {etapas.map((e: Etapa) => (
              <option key={e.etapa_id} value={e.etapa_id}>{e.etapa}</option>
            ))}
          </select>
          <div className="linhaInfo"><span className="labelInfo">Valor Estimado (R$)</span></div>
          <div className="grupoInput">
            <input
              className="inputCampo"
              type="number"
              value={valorEstimado}
              onChange={e => setValorEstimado(e.target.value)}
              placeholder="0,00"
            />
            <button className="botaoSalvarCampo" onClick={salvarValor} disabled={salvandoValor}>
              {salvandoValor ? '...' : 'Salvar'}
            </button>
          </div>

          {/* Tarefas */}
          <div className="cardTitulo" style={{ marginTop: 24 }}>Tarefas</div>
          <div className="listaTarefas">
            {tarefas.length === 0 && <span className="semDados">Sem tarefas ainda.</span>}
            {tarefas.map(t => {
              const vencida = t.prazo && new Date(t.prazo) < new Date() && t.status !== 'concluida';
              return (
                <div key={t.id} className={`itemTarefa ${t.status === 'concluida' ? 'tarefaConcluida' : ''}`}>
                  <input
                    type="checkbox"
                    className="checkboxTarefa"
                    checked={t.status === 'concluida'}
                    onChange={() => concluirTarefa(t.id, t.status)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="textoTarefa">{t.descricao}</div>
                    {t.tipo && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{t.tipo}</div>}
                  </div>
                  {t.prazo && (
                    <div className={`prazoTarefa ${vencida ? 'prazoVencido' : ''}`}>
                      {formatarData(t.prazo)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {mostrarFormTarefa ? (
            <div className="formularioTarefa">
              <div className="gridFormTarefa">
                <select className="selectCampo" value={novaTarefa.tipo} onChange={e => setNovaTarefa(p => ({ ...p, tipo: e.target.value }))}>
                  <option value="">Tipo</option>
                  <option value="Ligação">Ligação</option>
                  <option value="Visita">Visita</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Proposta">Proposta</option>
                </select>
                <input
                  className="inputCampo"
                  type="date"
                  value={novaTarefa.prazo}
                  onChange={e => setNovaTarefa(p => ({ ...p, prazo: e.target.value }))}
                />
              </div>
              <input
                className="inputCampo"
                style={{ marginBottom: 10, width: '100%', boxSizing: 'border-box' }}
                placeholder="Descrição da tarefa..."
                value={novaTarefa.descricao}
                onChange={e => setNovaTarefa(p => ({ ...p, descricao: e.target.value }))}
              />
              <div className="acoesForms">
                <button className="botaoRegistrar" onClick={criarTarefa} disabled={criandoTarefa || !novaTarefa.descricao}>
                  {criandoTarefa ? 'Criando...' : 'Criar Tarefa'}
                </button>
                <button style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13 }} onClick={() => setMostrarFormTarefa(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button className="botaoAdicionarTarefa" onClick={() => setMostrarFormTarefa(true)}>
              + Nova Tarefa
            </button>
          )}
        </div>
      </div>

      {/* Timeline de Interações */}
      <div className="cardTimeline">
        <div className="cardTitulo">Histórico de Interações</div>
        <div className="timeline">
          {interacoes.length === 0 && <span className="semDados">Sem interações registradas.</span>}
          {interacoes.map(i => (
            <div key={i.id} className="itemTimeline">
              <div className="tipoInteracao">
                {ICONES_TIPO[i.tipo] ?? '📝'} {i.tipo.charAt(0).toUpperCase() + i.tipo.slice(1)}
              </div>
              <div className="textoInteracao">{i.texto}</div>
              <div className="metaInteracao">{i.usuario} · {formatarDataHora(i.criado_em)}</div>
            </div>
          ))}
        </div>

        <div className="formularioInteracao">
          <div className="acoesForms" style={{ marginBottom: 10 }}>
            <select
              className="selectCampo"
              value={novaInteracao.tipo}
              onChange={e => setNovaInteracao(p => ({ ...p, tipo: e.target.value }))}
            >
              <option value="observacao">📝 Observação</option>
              <option value="ligacao">📞 Ligação</option>
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="email">📧 Email</option>
              <option value="visita">🏢 Visita</option>
            </select>
          </div>
          <textarea
            className="textareaInteracao"
            placeholder="Descreva a interação..."
            value={novaInteracao.texto}
            onChange={e => setNovaInteracao(p => ({ ...p, texto: e.target.value }))}
          />
          <div className="acoesForms">
            <button
              className="botaoRegistrar"
              onClick={registrarInteracao}
              disabled={registrando || !novaInteracao.texto.trim()}
            >
              {registrando ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
