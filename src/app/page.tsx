import { query } from '@/lib/db';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Carrossel from '@/components/Carrossel';
import GaleriaSobre from '@/components/GaleriaSobre';
import StyleReset from '@/components/StyleReset';
import FadeIn from '@/components/FadeIn';
import VehicleInventory from '@/components/VehicleInventory';
import './home.css';
import '../components/FadeIn.css'; 

export const dynamic = 'force-dynamic';

export default async function Home() {
  let carros: any[] = [];
  let midias: any[] = [];
  let midiasSobre: any[] = [];
  let bannerEstoque: any[] = [];

  try {
    carros = await query(`
      SELECT c.*,
             (SELECT imagem_url FROM TAB_CARRO_IMAGEM
              WHERE carro_id = c.id
              ORDER BY ordem LIMIT 1) as primeira_imagem
      FROM TAB_CARRO c
      WHERE c.disponivel = true
    `);

    midias = await query(`
      SELECT * FROM TAB_MIDIA
      WHERE secao = 'carrossel'
      ORDER BY ordem
    `);

    midiasSobre = await query(`
      SELECT * FROM TAB_MIDIA
      WHERE secao = 'sobre'
      ORDER BY ordem
    `);

    bannerEstoque = await query(`
      SELECT url FROM TAB_MIDIA
      WHERE secao = 'banner-estoque'
      ORDER BY ordem LIMIT 1
    `);
  } catch (error) {
    console.error('Erro ao carregar dados da home:', error);
  }

  const heroMidia = midias[0];

  return (
    <div className="container">
      <StyleReset />
      <Header />

      {/* Hero Section Premium */}
      <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff', marginTop: '0', paddingTop: '0' }}>
        {/* Background Dinâmico (Home/Carrossel) */}
        {heroMidia?.tipo === 'video' ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ position: 'absolute', top: '50%', left: '50%', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto', zIndex: 0, transform: 'translateX(-50%) translateY(-50%)', objectFit: 'cover' }}
          >
            <source src={heroMidia.url} type="video/mp4" />
          </video>
        ) : (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundImage: `url('${heroMidia?.url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920"}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}></div>
        )}
        
        {/* Overlay Darkener */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)', 
          zIndex: 1 
        }}></div>

        <FadeIn y={30} duration={1} style={{ zIndex: 2, padding: '60px 20px' }}>
          <span style={{ color: '#c5a059', fontWeight: 'bold', letterSpacing: '5px', fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>
            EXCELÊNCIA EM MOVIMENTO
          </span>
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(45px, 8vw, 90px)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '25px',
            textShadow: '2px 2px 10px rgba(0,0,0,0.3)'
          }}>
            A Máquina dos Seus <br/>
            <span style={{ 
              color: '#c5a059', 
              fontStyle: 'italic',
              fontSize: '0.9em'
            }}>Sonhos Está Aqui</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(16px, 2vw, 20px)', 
            opacity: 0.9, 
            marginBottom: '45px', 
            maxWidth: '700px', 
            margin: '0 auto 45px',
            fontWeight: '300',
            letterSpacing: '0.5px'
          }}>
            Especialistas em realizar sonhos. Há uma década sendo referência em <br/> 
            <strong>exclusividade e procedência</strong> no mercado automotivo de Araçatuba.
          </p>
          <a href="#estoque" className="btn-premium">
            Conheça nosso estoque
          </a>
        </FadeIn>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          animation: 'bounce 2s infinite'
        }}>
          <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, rgba(255,255,255,0), #fff)', margin: '0 auto' }}></div>
        </div>
      </section>

      <FadeIn>
        <section className="sobre">
          <div className="sobreContainer">
            <div className="sobreTexto">
              <span style={{ color: '#c5a059', fontWeight: 'bold', letterSpacing: '2px' }}>EXCELÊNCIA EM MOVIMENTO</span>
              <h2 className="sobreTitulo" style={{ fontSize: '42px', fontWeight: '800', marginTop: '10px' }}>LUCAS VEÍCULOS</h2>
              <p className="sobreDescricao">
                A LUCAS VEÍCULOS foi fundada em 2016, especializada na comercialização de veículos novos e seminovos. Uma empresa automotiva de multimarcas nacionais e importados, com compromisso de qualidade e transparência em cada negócio.
              </p>
              
              {/* Números em Destaque */}
              <div style={{ display: 'flex', gap: '30px', margin: '40px 0' }}>
                <div>
                  <h3 style={{ fontSize: '32px', color: '#c5a059', margin: 0 }}>+10</h3>
                  <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Anos de mercado</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '32px', color: '#c5a059', margin: 0 }}>+500</h3>
                  <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Clientes felizes</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '32px', color: '#c5a059', margin: 0 }}>+200</h3>
                  <p style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Veículos em pátio</p>
                </div>
              </div>

              <Link href="/empresa" className="sobreBotao">CONHEÇA NOSSA TRAJETÓRIA</Link>
            </div>
            
            <div className="sobreImagem">
              <GaleriaSobre midias={midiasSobre} />
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Seção de Inventário com Filtros Funcionais */}
      <section id="estoque" style={{ 
        padding: '100px 20px', 
        backgroundColor: '#000000',
        backgroundImage: bannerEstoque[0] 
          ? `linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.8) 100%), url('${bannerEstoque[0].url}')` 
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Adiciona um leve efeito de parallax
        backgroundRepeat: 'no-repeat'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <FadeIn>
              <span style={{ color: '#c5a059', fontWeight: 'bold', letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>
                Oportunidades Selecionadas
              </span>
              <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#fff', margin: '0 0 20px 0', letterSpacing: '-1px' }}>
                Confira Nosso Estoque
              </h2>
              <div style={{ width: '60px', height: '3px', backgroundColor: '#c5a059', margin: '0 auto' }}></div>
            </FadeIn>
          </div>
          <VehicleInventory initialCars={carros} />
        </div>
      </section>

      <Footer />
    </div>
  );
}