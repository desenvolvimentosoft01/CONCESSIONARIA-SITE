import { query } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import './servicos.css';

export const dynamic = 'force-dynamic';

export default async function ServicosPage() {
  const bannerServicos = await query(`SELECT url FROM TAB_MIDIA WHERE secao = 'banner-servicos' ORDER BY ordem LIMIT 1`);

  const servicos = [
    { icone: '🚗', titulo: 'Venda de Veículos', desc: 'Estoque selecionado com as melhores marcas e modelos do mercado.' },
    { icone: '💰', titulo: 'Financiamento', desc: 'Parceria com os principais bancos para as melhores taxas de crédito.' },
    { icone: '📋', titulo: 'Avaliação de Veículos', desc: 'Avaliação justa e transparente do seu usado na troca.' },
    { icone: '🤝', titulo: 'Consórcio', desc: 'Planeje a compra do seu carro com parcelas que cabem no seu bolso.' },
    { icone: '🔍', titulo: 'Revisão Pré-Venda', desc: 'Todos os nossos veículos passam por rigorosa inspeção técnica.' },
    { icone: '📄', titulo: 'Documentação', desc: 'Assessoria completa para transferência e regularização do seu veículo.' },
  ];

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ 
        padding: '160px 20px 80px', 
        background: bannerServicos[0] 
          ? `linear-gradient(180deg, rgba(26,26,26,0.9) 0%, rgba(51,51,51,0.8) 100%), url(${bannerServicos[0].url})` 
          : 'linear-gradient(180deg, #1a1a1a 0%, #333 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <FadeIn>
          <span style={{ display: 'block', color: '#c5a059', fontWeight: 'bold', letterSpacing: '4px', fontSize: '13px', marginBottom: '15px', textTransform: 'uppercase' }}>EXCELÊNCIA EM MOVIMENTO</span>
          <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0', fontFamily: 'var(--font-playfair), serif' }}>Nossos Serviços</h1>
          <p style={{ opacity: 0.7, maxWidth: '600px', margin: '20px auto' }}>Soluções completas para você realizar seu sonho automotivo.</p>
        </FadeIn>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {servicos.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 100}>
              <div className="servicoCard" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
                <div style={{ fontSize: '48px', marginBottom: '25px' }}>{item.icone}</div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '15px', color: '#fff' }}>{item.titulo}</h3>
                <p style={{ fontSize: '15px', color: '#aaa', lineHeight: '1.8' }}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}