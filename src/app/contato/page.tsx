import { query } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import './contato.css';

export const dynamic = 'force-dynamic';

export default async function ContatoPage() {
  let bannerContato: any[] = [];
  try {
    bannerContato = await query(`SELECT url FROM TAB_MIDIA WHERE secao = 'banner-contato' ORDER BY ordem LIMIT 1`);
  } catch (error) {
    console.error('Erro ao carregar banner de contato:', error);
  }

  return (
    <div className="container" style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', paddingTop: '0' }}>
      <Header />
      
      <div className="banner" style={{ 
        padding: '100px 20px', 
        background: bannerContato[0] 
          ? `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) 100%), url(${bannerContato[0].url})` 
          : 'linear-gradient(180deg, #1a1a1a 0%, #333 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <FadeIn>
          <span style={{ display: 'block', color: '#c5a059', fontWeight: 'bold', letterSpacing: '4px', fontSize: '13px', marginBottom: '15px', textTransform: 'uppercase' }}>EXCELÊNCIA EM MOVIMENTO</span>
          <h1 className="bannerTitulo">Fale Conosco</h1>
          <p className="bannerTexto">Estamos prontos para atender você</p>
        </FadeIn>
      </div>

      <main className="main">
        <div className="contatoContainer">
          <div className="infoContato">
            <h2 className="infoTitulo">Informações de Contato</h2>
            
            <div className="infoItem">
              <span className="infoIcone">📍</span>
              <div>
                <h3 className="infoLabel">Endereço</h3>
                <p className="infoTexto">Av. Teste, 1000 - Centro, Araçatuba/SP</p>
              </div>
            </div>
            
            <div className="infoItem">
              <span className="infoIcone">📞</span>
              <div>
                <h3 className="infoLabel">Telefone / WhatsApp</h3>
                <p className="infoTexto">(18) 99999-9999</p>
              </div>
            </div>
            
            <div className="infoItem">
              <span className="infoIcone">📧</span>
              <div>
                <h3 className="infoLabel">E-mail</h3>
                <p className="infoTexto">contato@lucasveiculos.com.br</p>
              </div>
            </div>
            
            <div className="infoItem">
              <span className="infoIcone">🕒</span>
              <div>
                <h3 className="infoLabel">Horário de Funcionamento</h3>
                <p className="infoTexto">Segunda a Sexta: 8h às 18h</p>
                <p className="infoTexto">Sábado: 8h às 13h</p>
              </div>
            </div>
          </div>

          <div className="formularioContato">
            <h2 className="formTitulo">Envie uma Mensagem</h2>
            {/* Formulário aqui... */}
            <p style={{ color: '' }}>Utilize nosso formulário para entrar em contato diretamente com nossa equipe de vendas.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}