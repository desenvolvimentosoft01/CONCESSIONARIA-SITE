import { query } from '@/lib/db';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GaleriaCarro from '@/components/GaleriaCarro';
import './detalhe.css';

export const dynamic = 'force-dynamic';

interface DetalheCarroPageProps {
  params: { id: string };
  searchParams: { from?: string };
}

export default async function DetalheCarroPage({ params, searchParams }: DetalheCarroPageProps) {
  const carros = await query('SELECT * FROM TAB_CARRO WHERE id = $1', [params.id]);
  const carro = carros[0];

  const voltarPara = searchParams.from === 'estoque' ? '/estoque' : '/';

  if (!carro) {
    return (
      <div className="detalhe-page">
        <Header />
        <div className="detalhe-conteudo">
          <h1>Carro não encontrado</h1>
          <Link href={voltarPara}>Voltar</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="detalhe-page">
      <Header />

      <div className="detalhe-conteudo">
        <Link href={voltarPara} className="detalhe-botaoVoltar">
          ← Voltar
        </Link>

        <div className="detalheContainer">
          <div className="galeriaContainer">
            <GaleriaCarro carroId={carro.id} />
          </div>

          <div className="infoContainer">
            <h1 className="tituloDetalhe">{carro.marca} {carro.modelo}</h1>
            <p className="anoDetalhe">Ano {carro.ano}</p>
            <p className="precoDetalhe">
              R$ {Number(carro.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>

            {carro.descricao && (
              <div className="descricao">
                <h2 className="descricaoTitulo">Sobre o veículo</h2>
                <p className="descricaoTexto">{carro.descricao}</p>
              </div>
            )}

            <div className="caracteristicas">
              <div className="caracteristicaItem">
                <span className="caracteristicaLabel">Marca</span>
                <span className="caracteristicaValor">{carro.marca}</span>
              </div>
              <div className="caracteristicaItem">
                <span className="caracteristicaLabel">Modelo</span>
                <span className="caracteristicaValor">{carro.modelo}</span>
              </div>
              <div className="caracteristicaItem">
                <span className="caracteristicaLabel">Ano</span>
                <span className="caracteristicaValor">{carro.ano}</span>
              </div>
              <div className="caracteristicaItem">
                <span className="caracteristicaLabel">Preço</span>
                <span className="caracteristicaValor">
                  R$ {Number(carro.preco).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <a 
              href={`https://wa.me/5518996692266?text=Olá, tenho interesse no ${carro.marca} ${carro.modelo} ${carro.ano}`}
              target="_blank"
              rel="noopener noreferrer"
              className="detalhe-botaoWhatsApp"
            >
              Falar com vendedor no WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}