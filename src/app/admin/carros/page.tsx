'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DeletarCarroButton } from './DeletarCarroButton';
import './admin-carros.css';

export default function AdminCarrosPage() {
  const searchParams = useSearchParams();
  const [carros, setCarros] = useState<any[]>([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [corSelecionada, setCorSelecionada] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaPlaca, setBuscaPlaca] = useState('');
  
  const mensagemSucesso = searchParams?.get('sucesso');
  const mensagemErro = searchParams?.get('erro');

  useEffect(() => {
    fetch('/api/carros/all')
      .then(res => res.json())
      .then(data => {
        setCarros(data);
        setCarrosFiltrados(data);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

  useEffect(() => {
    let resultado = [...carros];

    if (marcaSelecionada) {
      resultado = resultado.filter(carro => carro.marca === marcaSelecionada);
    }

    if (anoSelecionado) {
      resultado = resultado.filter(carro => carro.ano.toString() === anoSelecionado);
    }

    if (corSelecionada) {
      resultado = resultado.filter(carro => carro.cor === corSelecionada);
    }

    if (statusSelecionado) {
      const disponivel = statusSelecionado === 'disponivel';
      resultado = resultado.filter(carro => carro.disponivel === disponivel);
    }

    if (busca) {
      resultado = resultado.filter(carro => 
        carro.modelo.toLowerCase().includes(busca.toLowerCase()) ||
        carro.marca.toLowerCase().includes(busca.toLowerCase())
      );
    }

    if (buscaPlaca) {
      resultado = resultado.filter(carro => 
        carro.placa && carro.placa.toLowerCase().includes(buscaPlaca.toLowerCase())
      );
    }

    setCarrosFiltrados(resultado);
  }, [marcaSelecionada, anoSelecionado, corSelecionada, statusSelecionado, busca, buscaPlaca, carros]);

  const marcas = [...new Set(carros.map(carro => carro.marca))].sort();
  const anos = [...new Set(carros.map(carro => carro.ano))].sort((a, b) => b - a);
  const cores = [...new Set(carros.map(carro => carro.cor).filter(Boolean))].sort();

  function limparFiltros() {
    setMarcaSelecionada('');
    setAnoSelecionado('');
    setCorSelecionada('');
    setStatusSelecionado('');
    setBusca('');
    setBuscaPlaca('');
  }

  if (carregando) {
    return <div className="admin-carros-carregando">Carregando...</div>;
  }

  return (
    <div className="admin-carros-container">
      {mensagemSucesso && (
        <div className="admin-carros-mensagem-sucesso">
          ✅ {mensagemSucesso}
        </div>
      )}
      
      {mensagemErro && (
        <div className="admin-carros-mensagem-erro">
          ❌ {mensagemErro}
        </div>
      )}

      <div className="admin-carros-header">
        <div className="admin-carros-header-left">
          <Link href="/admin/dashboard" className="admin-carros-botao-voltar">
            ← Voltar
          </Link>
          <h1 className="admin-carros-titulo">🚗 Gerenciar Carros</h1>
        </div>
        <Link href="/admin/carros/novo" className="admin-carros-botao-novo">
          + Novo Carro
        </Link>
      </div>

      {/* FILTROS */}
      <div className="admin-carros-filtros">
        <select 
          className="admin-carros-select"
          value={marcaSelecionada}
          onChange={(e) => setMarcaSelecionada(e.target.value)}
        >
          <option value="">Todas as marcas</option>
          {marcas.map(marca => <option key={marca} value={marca}>{marca}</option>)}
        </select>
        
        <select 
          className="admin-carros-select"
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(e.target.value)}
        >
          <option value="">Todos os anos</option>
          {anos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
        </select>
        
        <select 
          className="admin-carros-select"
          value={corSelecionada}
          onChange={(e) => setCorSelecionada(e.target.value)}
        >
          <option value="">Todas as cores</option>
          {cores.map(cor => <option key={cor} value={cor}>{cor}</option>)}
        </select>
        
        <select 
          className="admin-carros-select"
          value={statusSelecionado}
          onChange={(e) => setStatusSelecionado(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="vendido">Vendido</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Buscar por marca ou modelo..."
          className="admin-carros-input"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <input 
          type="text" 
          placeholder="Buscar por placa..."
          className="admin-carros-input"
          value={buscaPlaca}
          onChange={(e) => setBuscaPlaca(e.target.value.toUpperCase())}
        />

        {(marcaSelecionada || anoSelecionado || corSelecionada || statusSelecionado || busca || buscaPlaca) && (
          <button className="admin-carros-botao-limpar" onClick={limparFiltros}>
            Limpar filtros
          </button>
        )}
      </div>

      <p className="admin-carros-resultado">{carrosFiltrados.length} veículo(s) encontrado(s)</p>

      <div className="admin-carros-tabela-container">
        <table className="admin-carros-tabela">
          <thead>
            <tr>
              <th className="admin-carros-th">ID</th>
              <th className="admin-carros-th">Marca</th>
              <th className="admin-carros-th">Modelo</th>
              <th className="admin-carros-th">Ano</th>
              <th className="admin-carros-th">Placa</th>
              <th className="admin-carros-th">Preço</th>
              <th className="admin-carros-th">Status</th>
              <th className="admin-carros-th">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carrosFiltrados.map((carro: any) => (
              <tr key={carro.id}>
                <td className="admin-carros-td">{carro.id}</td>
                <td className="admin-carros-td">{carro.marca}</td>
                <td className="admin-carros-td">{carro.modelo}</td>
                <td className="admin-carros-td">{carro.ano}</td>
                <td className="admin-carros-td">
                  {carro.placa ? `${carro.placa.slice(0, 3)}-${carro.placa.slice(3)}` : '-'}
                </td>
                <td className="admin-carros-td">
                  R$ {Number(carro.preco).toLocaleString('pt-BR')}
                </td>
                <td className="admin-carros-td">
                  <span className={carro.disponivel ? 'admin-carros-status-disponivel' : 'admin-carros-status-indisponivel'}>
                    {carro.disponivel ? 'Disponível' : 'Vendido'}
                  </span>
                </td>
                <td className="admin-carros-td">
                  <Link href={`/admin/carros/editar/${carro.id}`} className="admin-carros-botao-editar">
                    Editar
                  </Link>
                  <DeletarCarroButton id={carro.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}