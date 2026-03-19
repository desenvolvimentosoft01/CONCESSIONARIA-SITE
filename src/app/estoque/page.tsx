'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; 
import Footer from '@/components/Footer';
import StyleReset from '@/components/StyleReset';
import FadeIn from '@/components/FadeIn';
import './estoque.css';
import '../../components/FadeIn.css';

interface Carro {
  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  cor?: string;
  primeira_imagem: string | null;
  disponivel: boolean;
}

export default function EstoquePage() {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState<Carro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('');
  
  const [marcaSelecionada, setMarcaSelecionada] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [corSelecionada, setCorSelecionada] = useState('');
  const [ordenacao, setOrdenacao] = useState('menor-preco');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetch('/api/midia')
      .then(res => res.json())
      .then(data => {
        const banner = data.find((m: any) => m.secao === 'banner-estoque');
        if (banner) setBannerUrl(banner.url);
      })
      .catch(() => {});

    fetch('/api/carros')
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

    if (busca) {
      resultado = resultado.filter(carro => 
        carro.modelo.toLowerCase().includes(busca.toLowerCase())
      );
    }

    if (ordenacao === 'menor-preco') {
      resultado.sort((a, b) => a.preco - b.preco);
    } else if (ordenacao === 'maior-preco') {
      resultado.sort((a, b) => b.preco - a.preco);
    } else if (ordenacao === 'ano-novo') {
      resultado.sort((a, b) => b.ano - a.ano);
    } else if (ordenacao === 'ano-velho') {
      resultado.sort((a, b) => a.ano - b.ano);
    }

    setCarrosFiltrados(resultado);
  }, [marcaSelecionada, anoSelecionado, corSelecionada, ordenacao, busca, carros]);

  const marcas = [...new Set(carros.map(carro => carro.marca))].sort();
  const anos = [...new Set(carros.map(carro => carro.ano))].sort((a, b) => b - a);
  const cores = [...new Set(carros.map(carro => carro.cor).filter(Boolean))].sort();

  function limparFiltros() {
    setMarcaSelecionada('');
    setAnoSelecionado('');
    setCorSelecionada('');
    setOrdenacao('menor-preco');
    setBusca('');
  }

  if (carregando) {
    return <div className="carregando">Carregando veículos...</div>;
  }

  return (
    <div className="container">
      <StyleReset />
      <Header />

      <div className="banner" style={bannerUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <h1 className="bannerTitulo">Nosso Estoque</h1>
        <p className="bannerTexto">Confira todos os veículos disponíveis</p>
      </div>

      <div className="filtros">
        <div className="filtrosContainer">
          <select 
            className="select"
            value={marcaSelecionada}
            onChange={(e) => setMarcaSelecionada(e.target.value)}
          >
            <option value="">Todas as marcas</option>
            {marcas.map(marca => <option key={marca} value={marca}>{marca}</option>)}
          </select>
          
          <select 
            className="select"
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
          >
            <option value="">Todos os anos</option>
            {anos.map(ano => <option key={ano} value={ano}>{ano}</option>)}
          </select>
          
          <select 
            className="select"
            value={corSelecionada}
            onChange={(e) => setCorSelecionada(e.target.value)}
          >
            <option value="">Todas as cores</option>
            {cores.map(cor => <option key={cor} value={cor}>{cor}</option>)}
          </select>
          
          <select 
            className="select"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
          >
            <option value="menor-preco">Preço: menor para maior</option>
            <option value="maior-preco">Preço: maior para menor</option>
            <option value="ano-novo">Ano: mais novo</option>
            <option value="ano-velho">Ano: mais velho</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Buscar por modelo..."
            className="input"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {(marcaSelecionada || anoSelecionado || corSelecionada || busca || ordenacao !== 'menor-preco') && (
            <button className="botaoLimpar" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <div className="main">
        <p className="resultadoInfo">{carrosFiltrados.length} veículo(s) encontrado(s)</p>

        {carrosFiltrados.length === 0 ? (
          <div className="semCarros">
            <p>Nenhum veículo encontrado</p>
            <button className="botaoLimparGrande" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="carrosGrid">
            {carrosFiltrados.map((carro, index) => (
              <FadeIn key={carro.id} delay={index * 50}>
                <div className="card">
                  <div className="cardImagem">
                    {carro.primeira_imagem ? (
                      <img src={carro.primeira_imagem} alt={carro.modelo} />
                    ) : (
                      <div className="semImagem">🚗</div>
                    )}
                  </div>
                  <div className="cardInfo">
                    <h3 className="cardModelo">{carro.marca} {carro.modelo}</h3>
                    <p className="cardAno">Ano {carro.ano}</p>
                    <p className="cardPreco">
                      R$ {Number(carro.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="cardBotoes">
                      <Link href={`/carro/${carro.id}?from=estoque`} className="botaoDetalhes">
                        Ver detalhes
                      </Link>
                      <a 
                        href={`https://wa.me/5518996692266?text=Olá, tenho interesse no ${carro.marca} ${carro.modelo} ${carro.ano}`}
                        target="_blank"
                        className="botaoWhatsApp"
                      >
                        WhatsApp
                      </a>
                    </div>
                    <Link 
                      href={`/entrar?redirect=/admin/carros/editar/${carro.id}`} 
                      className="botaoEditarAnuncio"
                    >
                      ✏️ Editar Anúncio
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}