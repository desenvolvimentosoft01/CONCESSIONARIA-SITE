import Link from 'next/link';
import type React from 'react';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function safeCount(sql: string): Promise<number> {
  try {
    const rows = await query(sql);
    return parseInt(rows[0]?.total ?? '0', 10);
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const [totalCarros, totalLeads, tarefasVencidas, vendidosMes, novosSemana] = await Promise.all([
    safeCount('SELECT COUNT(*) as total FROM TAB_CARRO WHERE disponivel = true'),
    safeCount('SELECT COUNT(*) as total FROM TAB_LEAD'),
    safeCount("SELECT COUNT(*) as total FROM TAB_LEAD_TAREFA WHERE status = 'pendente' AND prazo < CURRENT_DATE"),
    safeCount("SELECT COUNT(*) as total FROM TAB_CARRO WHERE disponivel = false AND data_criacao >= date_trunc('month', NOW())"),
    safeCount("SELECT COUNT(*) as total FROM TAB_LEAD WHERE criado_em >= NOW() - INTERVAL '7 days'"),
  ]);

  return (
    <div style={{ padding: '24px' }}>

      {/* MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '28px' }}>
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px 22px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '1px', color: '#555', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Veículos Cadastrados</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>{totalCarros}</div>
          <div style={{ fontSize: '11px', color: '#555' }}>{vendidosMes} vendidos este mês</div>
        </div>
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px 22px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '1px', color: '#555', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Leads no CRM</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#c5a059', lineHeight: 1, marginBottom: '6px' }}>{totalLeads}</div>
          <div style={{ fontSize: '11px', color: '#555' }}>+{novosSemana} esta semana</div>
        </div>
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px 22px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '1px', color: '#555', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Tarefas Vencidas</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#dc3545', lineHeight: 1, marginBottom: '6px' }}>{tarefasVencidas}</div>
          <div style={{ fontSize: '11px', color: '#555' }}>Requerem atenção</div>
        </div>
      </div>

      {/* TÍTULO ACESSO RÁPIDO */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#c5a059', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>
        Acesso Rápido
      </div>

      {/* GRID 3×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
        <Link href="/admin/carros" style={card()}>
          <div style={{ fontSize: '26px', marginBottom: '14px' }}>🚗</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '5px' }}>Carros</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Gerenciar veículos do estoque</div>
        </Link>
        <Link href="/admin/midia" style={card()}>
          <div style={{ fontSize: '26px', marginBottom: '14px' }}>📁</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '5px' }}>Mídia</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Imagens e vídeos do site</div>
        </Link>
        <Link href="/admin/auditoria" style={card()}>
          <div style={{ fontSize: '26px', marginBottom: '14px' }}>📋</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '5px' }}>Auditoria</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Histórico de alterações</div>
        </Link>
        <Link href="/admin/personalizacao" style={card(true)}>
          <div style={{ fontSize: '26px', marginBottom: '14px' }}>🎨</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#c5a059', marginBottom: '5px' }}>Personalização</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Cores e tema do site</div>
        </Link>
        <Link href="/admin/crm" style={card(true)}>
          <div style={{ fontSize: '26px', marginBottom: '14px' }}>👥</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#c5a059', marginBottom: '5px' }}>CRM</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Leads, funil e follow-ups</div>
        </Link>
        <Link href="/admin/financiamento" style={card()}>
          <div style={{ fontSize: '26px', marginBottom: '14px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '5px' }}>Financiamento</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Conteúdo da página</div>
        </Link>
      </div>

    </div>
  );
}

function card(destaque = false): React.CSSProperties {
  return {
    background: '#0d0d0d',
    padding: '24px 22px',
    borderRadius: '6px',
    border: destaque ? '1px solid rgba(197,160,89,0.35)' : '1px solid #1a1a1a',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  };
}
