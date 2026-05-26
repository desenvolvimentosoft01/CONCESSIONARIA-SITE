'use client';

interface Lead {
  nome: string;
  veiculo: string | null;
  valor_estimado: number | null;
  atualizado_em: string;
}

export default function ExportarCSV({ leads }: { leads: Lead[] }) {
  function exportar() {
    const cabecalho = 'Nome,Veículo,Valor (R$),Data de Fechamento\n';
    const linhas = leads
      .map(l =>
        [
          `"${l.nome}"`,
          `"${l.veiculo ?? ''}"`,
          l.valor_estimado != null ? String(l.valor_estimado).replace('.', ',') : '',
          new Date(l.atualizado_em).toLocaleDateString('pt-BR'),
        ].join(',')
      )
      .join('\n');

    const blob = new Blob(['﻿' + cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-ganhos-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportar}
      style={{
        background: 'transparent',
        border: '1px solid rgba(197,160,89,0.4)',
        color: '#c5a059',
        fontSize: 11,
        fontWeight: 700,
        padding: '5px 14px',
        borderRadius: 4,
        cursor: 'pointer',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        transition: 'border-color 0.15s',
      }}
    >
      ↓ Exportar CSV
    </button>
  );
}
