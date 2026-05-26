'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Dado {
  label: string;
  total: number;
  atual: boolean;
}

export default function GraficoMeses({ dados }: { dados: Dado[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dados} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: '#555', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 4, fontSize: 12 }}
          labelStyle={{ color: '#888', marginBottom: 4 }}
          itemStyle={{ color: '#c5a059' }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          formatter={(value: number) => [value, 'Leads']}
        />
        <Bar dataKey="total" radius={[3, 3, 0, 0]}>
          {dados.map((entry, idx) => (
            <Cell key={idx} fill={entry.atual ? '#c5a059' : '#252525'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
