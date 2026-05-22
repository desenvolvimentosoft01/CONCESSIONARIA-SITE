'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './crm-funil.css';

interface Lead {
  id: number;
  nome: string;
  email: string;
  origem: string;
  criado_em: string;
  etapa_id: number;
  etapa_nome: string;
  etapa_cor: string;
  valor_estimado?: number;
  tem_tarefa_vencida?: boolean;
}

interface Etapa {
  etapa_id: number;
  etapa: string;
  cor: string;
  total: number;
}

function formatarData(d: string): string {
  return new Date(d).toLocaleDateString('pt-BR');
}

function formatarMoeda(v?: number): string {
  if (!v) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FunilPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const [leadsRes, dashRes] = await Promise.all([
        fetch('/api/leads?limit=500'),
        fetch('/api/leads/dashboard'),
      ]);
      const leadsData = await leadsRes.json();
      const dashData = await dashRes.json();
      setLeads(leadsData.leads ?? []);
      setEtapas(dashData.leadsPorEtapa ?? []);
      setCarregando(false);
    }
    carregar();
  }, []);

  const totalLeads = leads.length;

  return (
    <div className="paginaFunil">
      <div className="cabecalho">
        <h1 className="tituloPagina">Funil de Vendas</h1>
        <Link href="/admin/dashboard" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }}>← Painel</Link>
      </div>

      <nav className="navCrm">
        <Link href="/admin/crm" className="linkNav">Dashboard</Link>
        <Link href="/admin/crm/leads" className="linkNav">Leads</Link>
        <Link href="/admin/crm/funil" className="linkNav linkNavAtivo">Funil</Link>
        <Link href="/admin/crm/tarefas" className="linkNav">Tarefas</Link>
        <Link href="/admin/crm/relatorios" className="linkNav">Relatórios</Link>
        <Link href="/admin/crm/configuracoes" className="linkNav">Configurações</Link>
      </nav>

      <div className="barraAcoes">
        <div className="totalLeads">
          <strong>{totalLeads}</strong> leads no funil
        </div>
        <Link href="/admin/crm/leads" className="botaoNovoLead">+ Novo Lead</Link>
      </div>

      {carregando ? (
        <div style={{ color: '#444', textAlign: 'center', padding: 60 }}>Carregando...</div>
      ) : (
        <div className="kanbanContainer">
          <div className="kanban">
            {etapas.map(etapa => {
              const leadsEtapa = leads.filter(l => l.etapa_id === etapa.etapa_id);
              return (
                <div key={etapa.etapa_id} className="coluna">
                  <div className="cabecalhoColuna">
                    <span className="nomeColuna">{etapa.etapa}</span>
                    <span className="badgeContagem" style={{ backgroundColor: etapa.cor }}>
                      {leadsEtapa.length}
                    </span>
                  </div>
                  {leadsEtapa.length === 0 && <div className="semLeads">Sem leads</div>}
                  {leadsEtapa.map(lead => {
                    const ganho = etapa.etapa === 'Ganho';
                    const perdido = etapa.etapa === 'Perdido';
                    return (
                      <Link
                        key={lead.id}
                        href={`/admin/crm/leads/${lead.id}`}
                        className={`cartaoLead ${ganho ? 'cartaoLeadGanho' : ''} ${perdido ? 'cartaoLeadPerdido' : ''}`}
                      >
                        <div className="nomeLead">{lead.nome}</div>
                        <div className="metaLead">{lead.origem} · {formatarData(lead.criado_em)}</div>
                        <div className="valorLead">{formatarMoeda(lead.valor_estimado)}</div>
                        {lead.tem_tarefa_vencida && (
                          <div className="badgeTarefaVencida">⚠ Tarefa vencida</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
