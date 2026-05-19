import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import { query } from '@/lib/db';
import FinanciamentoForm from './FinanciamentoForm';
import DiferencialCard from './DiferencialCard';

export const dynamic = 'force-dynamic';

interface ConfigData {
  chave: string;
  valor: string;
}

interface Diferencial {
  titulo: string;
  descricao: string;
  icone: string;
}

interface Passo {
  numero: number;
  titulo: string;
  descricao: string;
}

export default async function FinanciamentoPage() {
  let configs: ConfigData[] = [];
  try {
    configs = await query('SELECT chave, valor FROM TAB_CONFIGURACAO WHERE chave LIKE $1 ORDER BY chave', ['financiamento_%']);
  } catch (error) {
    console.error('Erro ao buscar configurações de financiamento:', error);
  }

  const parseConfig = (chave: string, defaultValue: any = null) => {
    const config = configs.find((c) => c.chave === chave);
    if (!config) return defaultValue;
    try {
      return JSON.parse(config.valor);
    } catch {
      return config.valor;
    }
  };

  const titulo = parseConfig('financiamento_titulo', 'Realize Seu Sonho Automotivo');
  const subtitulo = parseConfig('financiamento_subtitulo', 'Taxas competitivas e aprovação rápida');
  const destaque = parseConfig('financiamento_destaque', 'Aprovação em até 24 horas');

  const diferenciais: Diferencial[] = parseConfig('financiamento_diferenciais', [
    { titulo: 'Aprovação Rápida', descricao: 'Resposta em até 24 horas', icone: '⚡' },
    { titulo: 'Taxas Competitivas', descricao: 'As melhores do mercado', icone: '📊' },
    { titulo: 'Processo Simplificado', descricao: 'Poucos documentos necessários', icone: '📋' },
    { titulo: 'Financiamento Integral', descricao: 'Financie até o valor total', icone: '💰' },
  ]);

  const vantagens: string[] = parseConfig('financiamento_vantagens', [
    'Carência de até 1 ano para primeira parcela',
    'Parcelamento em até 60 meses',
    'Parceiros com os maiores bancos do país',
    'Entrada a partir de 10%',
    'Seguro obrigatório incluído',
    'Sem taxa de processamento',
    'Aprovação 100% online',
    'Orientação jurídica durante todo o processo',
  ]);

  const passos: Passo[] = parseConfig('financiamento_passos', [
    { numero: 1, titulo: 'Preencha o Formulário', descricao: 'Informe seus dados e preferências de financiamento' },
    { numero: 2, titulo: 'Análise de Crédito', descricao: 'Nossa equipe analisa sua solicitação' },
    { numero: 3, titulo: 'Receba a Proposta', descricao: 'Você recebe uma proposta personalizada' },
    { numero: 4, titulo: 'Concretize a Compra', descricao: 'Finalize o financiamento e leve seu veículo' },
  ]);

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100vh' }}>
      <Header />

      {/* Hero Section */}
      <div
        style={{
          padding: '160px 20px 80px',
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%), url("/placeholder-hero.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <FadeIn>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                color: '#c5a059',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              💰 Financiamento de Veículos
            </span>
            <h1
              style={{
                fontFamily: "var(--font-playfair, 'Georgia', serif)",
                fontSize: '48px',
                fontWeight: 900,
                color: '#ffffff',
                margin: '20px 0 16px',
                letterSpacing: '-1px',
              }}
            >
              {titulo}
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#cccccc',
                marginBottom: '30px',
                lineHeight: 1.6,
              }}
            >
              {subtitulo}
            </p>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#c5a059',
                color: '#000000',
                padding: '10px 28px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '1px',
              }}
            >
              ⭐ {destaque}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Diferenciais */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 20px' }}>
        <FadeIn>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '36px',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '60px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Por Que Escolher a Lucas Veículos?
          </h2>
        </FadeIn>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
          }}
        >
          {diferenciais.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 100}>
              <DiferencialCard titulo={item.titulo} descricao={item.descricao} icone={item.icone} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Formulário */}
      <section style={{ backgroundColor: '#1a1a1a', padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <FadeIn>
            <h2
              style={{
                textAlign: 'center',
                fontSize: '36px',
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Solicite Seu Financiamento
            </h2>
            <p
              style={{
                textAlign: 'center',
                fontSize: '16px',
                color: '#aaaaaa',
                marginBottom: '50px',
              }}
            >
              Preencha o formulário abaixo e nossa equipe entrará em contato em breve
            </p>
          </FadeIn>
          <FinanciamentoForm />
        </div>
      </section>

      {/* Vantagens */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 20px' }}>
        <FadeIn>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '36px',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '60px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Vantagens Exclusivas
          </h2>
        </FadeIn>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
          }}
        >
          {vantagens.map((vantagem, idx) => (
            <FadeIn key={idx} delay={idx * 80}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div
                  style={{
                    fontSize: '24px',
                    flexShrink: 0,
                    color: '#c5a059',
                  }}
                >
                  ✓
                </div>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#dddddd',
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {vantagem}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section style={{ backgroundColor: '#1a1a1a', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <FadeIn>
            <h2
              style={{
                textAlign: 'center',
                fontSize: '36px',
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: '60px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Como Funciona
            </h2>
          </FadeIn>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
            }}
          >
            {passos.map((passo, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#c5a059',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      fontSize: '36px',
                      fontWeight: 900,
                      color: '#000000',
                    }}
                  >
                    {passo.numero}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
                    {passo.titulo}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#aaaaaa', lineHeight: 1.6 }}>
                    {passo.descricao}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
