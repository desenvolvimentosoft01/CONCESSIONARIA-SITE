import { query } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleMediaViewer from '@/components/VehicleMediaViewer';
import FadeIn from '@/components/FadeIn';
import Link from 'next/link';
import BotaoWhatsApp from './BotaoWhatsApp';

export default async function CarroDetalhesPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  let carroResult: any[] = [];
  let imagens: any[] = [];

  try {
    carroResult = await query('SELECT * FROM "TAB_CARRO" WHERE id = $1', [id]);
    imagens = await query('SELECT * FROM "TAB_CARRO_IMAGEM" WHERE carro_id = $1 ORDER BY ordem', [id]);
  } catch (error) {
    console.error('Erro ao carregar detalhes do carro:', error);
    return <div style={{ padding: '40px', textAlign: 'center' }}>Erro ao carregar veículo</div>;
  }

  if (carroResult.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Veículo não encontrado</div>;
  const carro = carroResult[0];

  // Fallback: se não há imagens em TAB_CARRO_IMAGEM, usa imagem_url do carro
  const imagensFinal = imagens.length > 0
    ? imagens
    : (carro.imagem_url ? [{ imagem_url: carro.imagem_url }] : []);

  const midias = imagensFinal.map((img: any) => ({
    url: img.imagem_url,
    tipo: img.imagem_url.includes('mp4') ? 'video' : 'imagem'
  }));

  return (
    <div style={{ backgroundColor: '#fff' }}>
      <Header />
      
      <main style={{ padding: '100px 0 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 'calc(100vh - 100px)' }}>
          
          {/* LADO ESQUERDO: Galeria */}
          <div style={{ flex: '1 1 60%', backgroundColor: '#000', position: 'relative' }}>
             <VehicleMediaViewer midias={midias} />
          </div>

          {/* LADO DIREITO: Informações */}
          <div style={{ flex: '1 1 40%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <FadeIn>
              <Link href="/estoque" style={{ color: '#999', textDecoration: 'none', fontSize: '14px', display: 'block', marginBottom: '20px' }}>
                ← VOLTAR PARA O ESTOQUE
              </Link>
              
              <span style={{ color: '#ff6b00', fontWeight: 'bold', fontSize: '14px' }}>{carro.marca}</span>
              <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0 0 10px', color: '#1a1a1a', letterSpacing: '-1px' }}>{carro.modelo}</h1>
              
              <div style={{ margin: '30px 0', padding: '30px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: '14px', color: '#999' }}>Preço de venda</span>
                <div style={{ fontSize: '42px', fontWeight: '900', color: '#ff6b00' }}>
                  R$ {Number(carro.preco).toLocaleString('pt-BR')}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div>
                  <span style={{ display: 'block', color: '#999', fontSize: '12px', textTransform: 'uppercase' }}>Ano</span>
                  <span style={{ fontWeight: '700', fontSize: '18px' }}>{carro.ano} / {carro.ano}</span>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#999', fontSize: '12px', textTransform: 'uppercase' }}>Quilometragem</span>
                  <span style={{ fontWeight: '700', fontSize: '18px' }}>{Number(carro.quilometragem).toLocaleString()} km</span>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#999', fontSize: '12px', textTransform: 'uppercase' }}>Combustível</span>
                  <span style={{ fontWeight: '700', fontSize: '18px' }}>{carro.combustivel || 'Flex'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#999', fontSize: '12px', textTransform: 'uppercase' }}>Cor</span>
                  <span style={{ fontWeight: '700', fontSize: '18px' }}>{carro.cor || 'Não informado'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <BotaoWhatsApp
                  carroId={carro.id}
                  marca={carro.marca}
                  modelo={carro.modelo}
                  ano={carro.ano}
                  telefone="5518996692266"
                />
                
                <Link
                  href={`/contato?carro_id=${id}`}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    textDecoration: 'none',
                  }}
                >
                  📩
                </Link>
              </div>
              
              <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Descrição do Vendedor:</h4>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  {carro.descricao || "Veículo em excelente estado de conservação, periciado e aprovado. Aceitamos seu usado na troca."}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}