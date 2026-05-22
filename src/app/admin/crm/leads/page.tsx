'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './crm-leads.css';

interface Lead {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  origem: string;
  etapa_nome: string;
  etapa_cor: string;
  carro_modelo?: string;
  criado_em: string;
}

interface Etapa {
  id: number;
  nome: string;
  cor: string;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(' ');
  const a = partes[0]?.[0] ?? '';
  const b = partes[partes.length - 1]?.[0] ?? '';
  return (partes.length > 1 ? a + b : a).toUpperCase();
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState('');
  const [novoLead, setNovoLead] = useState({
    nome: '', email: '', telefone: '', origem: 'manual',
    mensagem: '', etapa_id: '', valor_estimado: '',
  });

  useEffect(() => {
    carregarLeads();
    carregarEtapas();
  }, [filtroEtapa, filtroOrigem]);

  async function carregarLeads() {
    setCarregando(true);
    const params = new URLSearchParams({ limit: '100' });
    if (filtroEtapa) params.set('etapa_id', filtroEtapa);
    if (filtroOrigem) params.set('origem', filtroOrigem);
    const res = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setLeads(data.leads ?? []);
    setCarregando(false);
  }

  async function carregarEtapas() {
    const res = await fetch('/api/leads/dashboard');
    const data = await res.json();
    setEtapas(data.leadsPorEtapa ?? []);
  }

  const leadsFiltrados = leads.filter(l => {
    if (!busca) return true;
    return l.nome.toLowerCase().includes(busca.toLowerCase()) ||
           l.email.toLowerCase().includes(busca.toLowerCase());
  });

  async function salvarNovoLead() {
    if (!novoLead.nome || !novoLead.email) return;
    setSalvando(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoLead.nome,
          email: novoLead.email,
          telefone: novoLead.telefone || undefined,
          mensagem: novoLead.mensagem || undefined,
          origem: novoLead.origem,
          etapa_id: novoLead.etapa_id ? parseInt(novoLead.etapa_id) : 1,
          valor_estimado: novoLead.valor_estimado ? parseFloat(novoLead.valor_estimado) : undefined,
        }),
      });
      if (res.ok) {
        setModalAberto(false);
        setNovoLead({ nome: '', email: '', telefone: '', origem: 'manual', mensagem: '', etapa_id: '', valor_estimado: '' });
        await carregarLeads();
        setToast('Lead criado com sucesso!');
        setTimeout(() => setToast(''), 3000);
      }
    } finally {
      setSalvando(false);
    }
  }

  const filtroAtivo = busca || filtroEtapa || filtroOrigem;

  return (
    <div className="paginaLeads">
      <div className="cabecalho">
        <h1 className="tituloPagina">Leads</h1>
        <Link href="/admin/dashboard" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>
          ← Painel
        </Link>
      </div>

      <nav className="navCrm">
        <Link href="/admin/crm" className="linkNav">Dashboard</Link>
        <Link href="/admin/crm/leads" className="linkNav linkNavAtivo">Leads</Link>
        <Link href="/admin/crm/funil" className="linkNav">Funil</Link>
        <Link href="/admin/crm/tarefas" className="linkNav">Tarefas</Link>
        <Link href="/admin/crm/relatorios" className="linkNav">Relatórios</Link>
        <Link href="/admin/crm/configuracoes" className="linkNav">Configurações</Link>
      </nav>

      <div className="barraFiltros">
        <input
          type="text"
          className="inputBusca"
          placeholder="Buscar por nome ou email..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <select className="selectFiltro" value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)}>
          <option value="">Todas as etapas</option>
          {etapas.map((e: any) => (
            <option key={e.etapa_id} value={e.etapa_id}>{e.etapa}</option>
          ))}
        </select>
        <select className="selectFiltro" value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value)}>
          <option value="">Todas as origens</option>
          <option value="contato">Contato</option>
          <option value="financiamento">Financiamento</option>
          <option value="manual">Manual</option>
        </select>
        {filtroAtivo && (
          <button className="botaoLimpar" onClick={() => { setBusca(''); setFiltroEtapa(''); setFiltroOrigem(''); }}>
            Limpar filtros
          </button>
        )}
        <button className="botaoNovoLead" onClick={() => setModalAberto(true)}>
          + Novo Lead
        </button>
      </div>

      <div className="tabelaContainer">
        <table className="tabela">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Etapa</th>
              <th>Origem</th>
              <th>Veículo</th>
              <th>Data de entrada</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={5} className="semLeads">Carregando...</td></tr>
            ) : leadsFiltrados.length === 0 ? (
              <tr><td colSpan={5} className="semLeads">Nenhum lead encontrado.</td></tr>
            ) : leadsFiltrados.map(lead => (
              <tr key={lead.id} onClick={() => router.push(`/admin/crm/leads/${lead.id}`)}>
                <td>
                  <div className="avatarCelula">
                    <div className="avatar" style={{ backgroundColor: lead.etapa_cor ?? '#333' }}>
                      {iniciais(lead.nome)}
                    </div>
                    <div>
                      <div className="nomeLead">{lead.nome}</div>
                      <div className="emailLead">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badgeEtapa" style={{ backgroundColor: lead.etapa_cor ?? '#333' }}>
                    {lead.etapa_nome ?? 'Novo'}
                  </span>
                </td>
                <td>
                  <span className="badgeOrigem">{lead.origem}</span>
                </td>
                <td className="veiculoColuna">{lead.carro_modelo ?? '—'}</td>
                <td className="dataColuna">{formatarData(lead.criado_em)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Lead */}
      {modalAberto && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setModalAberto(false); }}>
          <div className="modal">
            <div className="modalTitulo">+ Novo Lead</div>
            <div className="camposModal">
              <div className="grupo">
                <label className="label">Nome *</label>
                <input className="input" value={novoLead.nome} onChange={e => setNovoLead(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" />
              </div>
              <div className="grupo">
                <label className="label">Email *</label>
                <input className="input" type="email" value={novoLead.email} onChange={e => setNovoLead(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" />
              </div>
              <div className="grupo">
                <label className="label">Telefone</label>
                <input className="input" value={novoLead.telefone} onChange={e => setNovoLead(p => ({ ...p, telefone: e.target.value }))} placeholder="(18) 99999-9999" />
              </div>
              <div className="grupo">
                <label className="label">Origem</label>
                <select className="select" value={novoLead.origem} onChange={e => setNovoLead(p => ({ ...p, origem: e.target.value }))}>
                  <option value="manual">Manual</option>
                  <option value="contato">Contato</option>
                  <option value="financiamento">Financiamento</option>
                </select>
              </div>
              <div className="grupo">
                <label className="label">Etapa inicial</label>
                <select className="select" value={novoLead.etapa_id} onChange={e => setNovoLead(p => ({ ...p, etapa_id: e.target.value }))}>
                  <option value="">Novo (padrão)</option>
                  {etapas.map((e: any) => (
                    <option key={e.etapa_id} value={e.etapa_id}>{e.etapa}</option>
                  ))}
                </select>
              </div>
              <div className="grupo">
                <label className="label">Valor estimado (R$)</label>
                <input className="input" type="number" value={novoLead.valor_estimado} onChange={e => setNovoLead(p => ({ ...p, valor_estimado: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="grupo">
                <label className="label">Observações</label>
                <textarea className="textarea" value={novoLead.mensagem} onChange={e => setNovoLead(p => ({ ...p, mensagem: e.target.value }))} placeholder="Interesse, veículo desejado..." />
              </div>
            </div>
            <div className="acoesModal">
              <button className="botaoCancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button className="botaoSalvar" onClick={salvarNovoLead} disabled={salvando || !novoLead.nome || !novoLead.email}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
