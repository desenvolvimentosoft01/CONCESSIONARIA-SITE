import { query } from '@/lib/db';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Carrossel from '@/components/Carrossel';
import GaleriaSobre from '@/components/GaleriaSobre';
import StyleReset from '@/components/StyleReset';
import FadeIn from '@/components/FadeIn';
import './home.css';
import '../components/FadeIn.css'; 

export const dynamic = 'force-dynamic';

export default async function Home() {
  const carros = await query(`
    SELECT c.*, 
           (SELECT imagem_url FROM TAB_CARRO_IMAGEM 
            WHERE carro_id = c.id 
            ORDER BY ordem LIMIT 1) as primeira_imagem
    FROM TAB_CARRO c
    WHERE c.disponivel = true
  `);

  const midias = await query(`
    SELECT * FROM TAB_MIDIA 
    WHERE secao = 'carrossel' 
    ORDER BY ordem
  `);

  const midiasSobre = await query(`
    SELECT * FROM TAB_MIDIA 
    WHERE secao = 'sobre' 
    ORDER BY ordem
  `);

  return (
    <div className="container">
      <StyleReset />
      <Header />

      <Carrossel midias={midias} />

      <FadeIn>
        <section className="sobre">
          <div className="sobreContainer">
            <div className="sobreTexto">
              <h2 className="sobreTitulo">SOBRE NÓS</h2>
              <p className="sobreDescricao">
                A LUCAS VEÍCULOS foi fundada em 2016, especializada na comercialização 
                de veículos novos e seminovos.
              </p>
              <p className="sobreDescricao">
                Uma empresa automotiva de multimarcas nacionais e importados, 
                com compromisso de qualidade e transparência em cada negócio.
              </p>
              <a href="/empresa" className="sobreBotao">CLIQUE AQUI PARA SABER MAIS!</a>
            </div>
            
            <div className="sobreImagem">
              <GaleriaSobre midias={midiasSobre} />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <section className="destaque">
          <h2 className="destaqueTitulo">Veículos em Destaque</h2>
          <div className="carrosGrid">
            {carros.slice(0, 3).map((carro: any, index: number) => (
              <FadeIn key={carro.id} delay={index * 100}>
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
                      <Link href={`/carro/${carro.id}?from=home`} className="botaoDetalhes">
                        Ver detalhes
                      </Link>
                      <a 
                        href={`https://wa.me/5518996692266?text=Olá, tenho interesse no ${carro.marca} ${carro.modelo}`}
                        target="_blank"
                        className="botaoWhatsApp"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      </FadeIn>

      <Footer />
    </div>
  );
}