import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import { query } from '@/lib/db';
import './servicos.css';
import '../../components/FadeIn.css';

export const dynamic = 'force-dynamic';

export default async function ServicosPage() {
  const bannerServicos = await query(`SELECT url FROM TAB_MIDIA WHERE secao = 'banner-servicos' ORDER BY ordem LIMIT 1`);
  return (
    <div className="container">
      <Header />

      <div className="banner" style={bannerServicos[0] ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bannerServicos[0].url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <h1 className="bannerTitulo">Nossos Serviços</h1>
        <p className="bannerTexto">Soluções completas para você e seu veículo</p>
      </div>

      <div className="main">
        <div className="servicosGrid">
          <FadeIn delay={0}>
            <div className="servicoCard">
              <div className="servicoIcone">💰</div>
              <h2 className="servicoTitulo">Financiamento</h2>
              <p className="servicoDescricao">
                As melhores taxas do mercado, parcelas que cabem no seu bolso 
                e aprovação rápida.
              </p>
              <ul className="servicoLista">
                <li className="servicoItem">✓ Taxas a partir de 0,99% ao mês</li>
                <li className="servicoItem">✓ Aprovação em até 24h</li>
                <li className="servicoItem">✓ Parcelamento em até 60x</li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="servicoCard">
              <div className="servicoIcone">🔧</div>
              <h2 className="servicoTitulo">Oficina</h2>
              <p className="servicoDescricao">
                Oficina completa com profissionais especializados e equipamentos 
                de última geração.
              </p>
              <ul className="servicoLista">
                <li className="servicoItem">✓ Revisão programada</li>
                <li className="servicoItem">✓ Mecânica em geral</li>
                <li className="servicoItem">✓ Funilaria e pintura</li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="servicoCard">
              <div className="servicoIcone">📋</div>
              <h2 className="servicoTitulo">Consultoria</h2>
              <p className="servicoDescricao">
                Ajudamos você a escolher o carro ideal para seu perfil e 
                necessidade. Avaliamos seu veículo usado.
              </p>
              <ul className="servicoLista">
                <li className="servicoItem">✓ Avaliação de veículos</li>
                <li className="servicoItem">✓ Consultoria personalizada</li>
                <li className="servicoItem">✓ Negociação facilitada</li>
              </ul>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={300}>
          <div className="cta">
            <h2 className="ctaTitulo">Fale com um consultor</h2>
            <p className="ctaTexto">
              Nossa equipe está preparada para atender você da melhor forma.
            </p>
            <div className="ctaBotoes">
              <a href="https://wa.me/5518996692266" target="_blank" className="ctaBotaoWhatsApp">WhatsApp</a>
              <Link href="/contato" className="ctaBotaoContato">Formulário</Link>
            </div>
          </div>
        </FadeIn>
      </div>

      <Footer />
    </div>
  );
}
