import { query } from '@/lib/db';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GaleriaSobre from '@/components/GaleriaSobre';
import FadeIn from '@/components/FadeIn';
import './empresa.css';

export const dynamic = 'force-dynamic';

export default async function EmpresaPage() {
  let midiasEmpresa: any[] = [];
  let bannerEmpresa: any[] = [];
  try {
    midiasEmpresa = await query(`SELECT * FROM TAB_MIDIA WHERE secao = 'empresa' ORDER BY ordem`);
    bannerEmpresa = await query(`SELECT url FROM TAB_MIDIA WHERE secao = 'banner-empresa' ORDER BY ordem LIMIT 1`);
  } catch (error) {
    console.error('Erro ao carregar dados da empresa:', error);
  }

  return (
    <div className="empresa-container" style={{ backgroundColor: '#fcfcfc' }}>
      <Header />

      <div style={{ 
        padding: '100px 20px 80px', 
        background: bannerEmpresa[0] 
          ? `linear-gradient(180deg, rgba(26,26,26,0.9) 0%, rgba(51,51,51,0.8) 100%), url(${bannerEmpresa[0].url})` 
          : 'linear-gradient(180deg, #1a1a1a 0%, #333 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <FadeIn>
          <span style={{ display: 'block', color: '#c5a059', fontWeight: 'bold', letterSpacing: '4px', fontSize: '13px', marginBottom: '15px', textTransform: 'uppercase' }}>EXCELÊNCIA EM MOVIMENTO</span>
          <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0', fontFamily: 'var(--font-playfair), serif' }}>Nossa História</h1>
          <p style={{ opacity: 0.7, maxWidth: '600px', margin: '20px auto' }}>Conheça a trajetória de sucesso da LUCAS VEÍCULOS</p>
        </FadeIn>
      </div>

      <div className="empresa-main">
        <div className="empresa-sobre-container sobreContainer" style={{ padding: '80px 20px' }}>
          <div className="sobreTexto">
            <h2 className="empresa-titulo titulo">Sobre a LUCAS VEÍCULOS</h2>
            
            <p className="empresa-paragrafo paragrafo">
              A LUCAS VEÍCULOS foi fundada em 2016, especializada na comercialização de veículos novos e seminovos. 
              Uma empresa automotiva de multimarcas nacionais e importados, com compromisso de qualidade e transparência em cada negócio.
            </p>
            
            <p className="empresa-paragrafo paragrafo">
              Nossa trajetória é pautada na confiança e na busca constante pela satisfação total de nossos clientes, oferecendo sempre o que há de melhor no mercado automotivo.
            </p>

            <div className="empresa-numeros numeros">
              <div className="empresa-numero-item numeroItem">
                <span className="empresa-numero-valor numeroValor">+10</span>
                <span className="empresa-numero-label numeroLabel">Anos de história</span>
              </div>
              <div className="empresa-numero-item numeroItem">
                <span className="empresa-numero-valor numeroValor">+500</span>
                <span className="empresa-numero-label numeroLabel">Clientes felizes</span>
              </div>
              <div className="empresa-numero-item numeroItem">
                <span className="empresa-numero-valor numeroValor">+200</span>
                <span className="empresa-numero-label numeroLabel">Veículos em pátio</span>
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