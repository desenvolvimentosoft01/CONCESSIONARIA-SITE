import { query } from '@/lib/db';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GaleriaSobre from '@/components/GaleriaSobre';
import './empresa.css';

export const dynamic = 'force-dynamic';

export default async function EmpresaPage() {
  const midiasEmpresa = await query(`SELECT * FROM TAB_MIDIA WHERE secao = 'empresa' ORDER BY ordem`);
  const bannerEmpresa = await query(`SELECT url FROM TAB_MIDIA WHERE secao = 'banner-empresa' ORDER BY ordem LIMIT 1`);

  return (
    <div className="empresa-container">
      <Header />

      <div className="empresa-banner" style={bannerEmpresa[0] ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bannerEmpresa[0].url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <h1 className="empresa-banner-titulo">Nossa História</h1>
        <p className="empresa-banner-texto">Conheça a trajetória de sucesso da LUCAS VEÍCULOS</p>
      </div>

      <div className="empresa-main">
        <div className="empresa-sobre-container sobreContainer">
          <div className="sobreTexto">
            <h2 className="empresa-titulo titulo">Sobre a LUCAS VEÍCULOS</h2>
            
            <p className="empresa-paragrafo paragrafo">
              Fundada em 2016, a LUCAS VEÍCULOS nasceu do sonho de dois amigos que sempre foram apaixonados por carros. 
              Com muito trabalho e dedicação, construímos uma das maiores redes de concessionárias da região.
            </p>
            
            <p className="empresa-paragrafo paragrafo">
              Especializada na comercialização e intermediação de automóveis 0 km e seminovos, 
              somos uma empresa automotiva de multimarcas nacionais e importados.
            </p>

            <div className="empresa-numeros numeros">
              <div className="empresa-numero-item numeroItem">
                <span className="empresa-numero-valor numeroValor">10</span>
                <span className="empresa-numero-label numeroLabel">Anos de história</span>
              </div>
              <div className="empresa-numero-item numeroItem">
                <span className="empresa-numero-valor numeroValor">5000+</span>
                <span className="empresa-numero-label numeroLabel">Clientes satisfeitos</span>
              </div>
              <div className="empresa-numero-item numeroItem">
                <span className="empresa-numero-valor numeroValor">10</span>
                <span className="empresa-numero-label numeroLabel">Marcas parceiras</span>
              </div>
            </div>
          </div>

          <div className="empresa-sobre-imagem sobreImagem">
            <GaleriaSobre midias={midiasEmpresa} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}