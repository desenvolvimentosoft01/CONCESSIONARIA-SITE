import { query } from '@/lib/db';
import Link from 'next/link';
import './crm-configuracoes.css';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesCrmPage() {
  const etapas = await query(
    'SELECT * FROM TAB_LEAD_ETAPA ORDER BY ordem'
  );

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
          <div className="cardTitulo">Etapas do Funil</div>
          <div className="listaEtapas">
            {etapas.map((e: any) => (
              <div key={e.id} className="itemEtapa">
                <span className="dragHandle">⠿</span>
                <div className="pontoEtapa" style={{ backgroundColor: e.cor }} />
                <span className="nomeEtapa">{e.nome}</span>
                <span className="idEtapa">#{e.id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="separadorColunaLateral">
          {/* Tipos de Interação */}
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

          {/* Captura Automática */}
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
