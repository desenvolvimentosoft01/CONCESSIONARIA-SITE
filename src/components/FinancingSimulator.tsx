'use client';
import React, { useState, useEffect } from 'react';

export default function FinancingSimulator({ veiculos }: { veiculos: any[] }) {
  const [veiculoId, setVeiculoId] = useState('');
  const [valorVeiculo, setValorVeiculo] = useState(0);
  const [entrada, setEntrada] = useState(0);
  const [parcelas, setParcelas] = useState(48);
  const [resultado, setResultado] = useState(0);

  useEffect(() => {
    const selecionado = veiculos.find(v => v.id === Number(veiculoId));
    if (selecionado) {
      setValorVeiculo(Number(selecionado.preco));
    }
  }, [veiculoId, veiculos]);

  useEffect(() => {
    const calcularParcela = () => {
      const valorFinanciado = valorVeiculo - entrada;
      if (valorFinanciado <= 0) return 0;

      const taxaMensal = 0.0149; // Taxa de 1.49% a.m. (Exemplo comercial)
      const pmt = (valorFinanciado * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -parcelas));
      return pmt;
    };

    setResultado(calcularParcela());
  }, [valorVeiculo, entrada, parcelas]);

  const handleWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Olá Lucas Veículos! Gostaria de uma proposta de financiamento.%0A%0A` +
                `Veículo: ${veiculos.find(v => v.id === Number(veiculoId))?.modelo || 'Não especificado'}%0A` +
                `Entrada: R$ ${entrada.toLocaleString()}%0A` +
                `Parcelas: ${parcelas}x de R$ ${resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    window.open(`https://wa.me/5518996692266?text=${msg}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {/* Formulário */}
      <div style={{ flex: '1 1 600px', padding: '60px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px' }}>Solicite sua Proposta</h3>
        <form onSubmit={handleWhatsApp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: '1 / span 2' }}>
            <label style={labelStyle}>Veículo de Interesse</label>
            <select 
              required
              style={inputStyle} 
              value={veiculoId} 
              onChange={(e) => setVeiculoId(e.target.value)}
            >
              <option value="">Selecione um carro do estoque...</option>
              {veiculos.map(v => (
                <option key={v.id} value={v.id}>{v.marca} {v.modelo} - R$ {Number(v.preco).toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Valor de Entrada (R$)</label>
            <input 
              type="number" 
              style={inputStyle} 
              value={entrada} 
              onChange={(e) => setEntrada(Number(e.target.value))}
              placeholder="Ex: 20000"
            />
          </div>

          <div>
            <label style={labelStyle}>Parcelamento</label>
            <select style={inputStyle} value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
              {[12, 24, 36, 48, 60].map(m => <option key={m} value={m}>{m} Meses</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1 / span 2', marginTop: '20px' }}>
            <button type="submit" style={{ 
              width: '100%', 
              padding: '20px', 
              backgroundColor: '#1a1a1a', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              cursor: 'pointer'
            }}>Enviar Solicitação via WhatsApp</button>
          </div>
        </form>
      </div>

      {/* Display do Resultado */}
      <div style={{ flex: '1 1 300px', backgroundColor: '#fcfcfc', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid #eee' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase', fontWeight: 'bold' }}>Estimativa da Parcela</span>
          <div style={{ margin: '20px 0' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', verticalAlign: 'super' }}>R$</span>
            <span style={{ fontSize: '56px', fontWeight: '900', color: '#c5a059' }}>
              {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#999', lineHeight: '1.6' }}>
            * Valores baseados em taxas médias de mercado. <br />
            Sujeito a análise de crédito e variação de taxa por CPF.
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#999',
  textTransform: 'uppercase',
  marginBottom: '8px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  borderRadius: '8px',
  border: '1px solid #eee',
  backgroundColor: '#f9f9f9',
  fontSize: '15px'
};