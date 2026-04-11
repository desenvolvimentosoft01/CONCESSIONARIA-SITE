'use client';
import React, { useState, useMemo, useEffect } from 'react';
import VehicleCard from './VehicleCard';
import FadeIn from './FadeIn';

export default function VehicleInventory({ initialCars }: { initialCars: any[] }) {
  // Estrutura de Estado conforme solicitado
  const [veiculos] = useState(initialCars); // Lista completa imutável para referência
  const [veiculosFiltrados, setVeiculosFiltrados] = useState(initialCars);
  const [filtroMarca, setFiltroMarca] = useState("todas");
  const [filtroPrecoMin, setFiltroPrecoMin] = useState<number>(0);
  const [filtroPrecoMax, setFiltroPrecoMax] = useState<number>(1000000);
  const [searchTerm, setSearchTerm] = useState('');

  const brands = useMemo(() => {
    const list = veiculos.map(c => c.marca);
    return Array.from(new Set(list)).sort();
  }, [veiculos]);

  // Função applyFilters corrigida
  const applyFilters = () => {
    let filtrados = [...veiculos];
    
    // Filtro por marca
    if (filtroMarca !== "todas") {
      filtrados = filtrados.filter(v => v.marca === filtroMarca);
    }
    
    // Filtro por preço
    filtrados = filtrados.filter(v => 
      Number(v.preco) >= filtroPrecoMin && Number(v.preco) <= filtroPrecoMax
    );

    // Filtro por busca textual (opcional mas útil)
    if (searchTerm) {
      filtrados = filtrados.filter(v => 
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setVeiculosFiltrados(filtrados);
  };

  const clearFilters = () => {
    setFiltroMarca('todas');
    setFiltroPrecoMin(0);
    setFiltroPrecoMax(1000000);
    setSearchTerm('');
    setVeiculosFiltrados(veiculos);
  };

  return (
    <div className="inventory-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
      {/* Só exibe o título se não estiver em uma seção que já tenha título (como a Home) */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ color: '#c5a059', fontWeight: 'bold', letterSpacing: '4px', fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>
          Procedência e Exclusividade
        </span>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-playfair), serif', marginTop: '0', letterSpacing: '-1px' }}>
          Encontre sua Próxima Conquista
        </h2>
      </div>

      {/* Barra de Filtros Horizontal - Estilo Profissional */}
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '25px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        alignItems: 'flex-end',
        marginBottom: '60px',
        border: '1px solid #f0f0f0',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#999' }}>BUSCAR MODELO</label>
          <input 
            type="text" 
            placeholder="Digite o modelo (Ex: Civic)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #eee', fontSize: '15px' }}
          />
        </div>

        <div style={{ flex: '1 1 180px', minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#999' }}>MARCA</label>
          <select 
            value={filtroMarca} 
            onChange={(e) => setFiltroMarca(e.target.value)}
            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #eee', fontSize: '15px', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
          >
            <option value="todas">Todas as marcas</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#999' }}>VALOR MÍNIMO (R$)</label>
          <input 
            type="number" 
            value={filtroPrecoMin}
            onChange={(e) => setFiltroPrecoMin(e.target.value === '' ? 0 : Number(e.target.value))}
            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #eee', fontSize: '15px', backgroundColor: '#fdfdfd' }}
          />
        </div>

        <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#999' }}>VALOR MÁXIMO (R$)</label>
          <input 
            type="number" 
            value={filtroPrecoMax}
            onChange={(e) => setFiltroPrecoMax(e.target.value === '' ? 1000000 : Number(e.target.value))}
            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #eee', fontSize: '15px', backgroundColor: '#fdfdfd' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flex: '1 1 250px', minWidth: '200px' }}>
          <button 
            onClick={applyFilters}
            style={{ flex: 2, padding: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c5a059'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
          >
            APLICAR FILTROS
          </button>
          <button 
            onClick={clearFilters}
            style={{ flex: 1, padding: '15px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            LIMPAR
          </button>
        </div>
      </div>

      {/* Grade de Veículos */}
      {veiculosFiltrados.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', 
          gap: '40px' 
        }}>
          {veiculosFiltrados.map((carro, index) => (
            <VehicleCard key={carro.id} carro={carro} index={index} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <span style={{ fontSize: '50px' }}>🔍</span>
          <h3 style={{ marginTop: '20px', color: '#666' }}>Nenhum veículo encontrado com esses filtros.</h3>
          <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#c5a059', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
            Ver todos os veículos
          </button>
        </div>
      )}
    </div>
  );
}