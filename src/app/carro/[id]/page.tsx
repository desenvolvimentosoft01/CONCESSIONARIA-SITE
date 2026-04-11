import { query } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleMediaViewer from '@/components/VehicleMediaViewer';
import FadeIn from '@/components/FadeIn';
import Link from 'next/link';

export default async function CarroDetalhesPage({ params }: { params: { id: string } }) {
  const carroResult = await query('SELECT * FROM TAB_CARRO WHERE id = $1', [params.id]);
  const imagens = await query('SELECT * FROM TAB_CARRO_IMAGEM WHERE carro_id = $1 ORDER BY ordem', [params.id]);
  
  if (carroResult.length === 0) return <div>Veículo não encontrado</div>;
  const carro = carroResult[0];

  // Simulação de mídias mistas (Imagens e Vídeos)
  const midias = imagens.map((img: any) => ({
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
                <a 
                  href={`https://wa.me/5518996692266?text=Tenho interesse no ${carro.modelo}`}
                  target="_blank"
                  style={{ 
                    flex: 1,
                    padding: '20px', 
                    backgroundColor: '#25d366', 
                    color: '#fff', 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '16px',
                    boxShadow: '0 10px 20px rgba(37, 211, 102, 0.2)'
                  }}
                >
                  NEGOCIAR VIA WHATSAPP
                </a>
                
                <button style={{ 
                  padding: '20px', 
                  backgroundColor: '#f5f5f5', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer' 
                }}>
                  📩
                </button>
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