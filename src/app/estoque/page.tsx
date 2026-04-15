import { query } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FadeIn from '@/components/FadeIn';
import VehicleInventory from '@/components/VehicleInventory';

export const dynamic = 'force-dynamic';

export default async function EstoquePage({ searchParams }: any) {
  const marca = searchParams.marca || '';

  const sql = `
    SELECT c.*,
           (SELECT imagem_url FROM TAB_CARRO_IMAGEM
            WHERE carro_id = c.id
            ORDER BY ordem LIMIT 1) as primeira_imagem
    FROM TAB_CARRO c
    WHERE c.disponivel = true
    ${marca ? 'AND c.marca ILIKE $1' : ''}
    ORDER BY c.id DESC
  `;

  let carros: any[] = [];
  try {
    carros = await query(sql, marca ? [`%${marca}%`] : []);
  } catch (error) {
    console.error('Erro ao carregar estoque:', error);
  }

  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ 
        padding: '160px 20px 80px', 
        background: 'linear-gradient(180deg, #1a1a1a 0%, #333 100%)',
        textAlign: 'center',
        color: '#fff'
      }}>
        <FadeIn>
          <span style={{ display: 'block', color: '#c5a059', fontWeight: 'bold', letterSpacing: '4px', fontSize: '13px', marginBottom: '15px' }}>NOSSO ESTOQUE</span>
          <h1 style={{ fontSize: '48px', fontWeight: '800', margin: '0' }}>Veículos Disponíveis</h1>
          <p style={{ opacity: 0.7, maxWidth: '600px', margin: '20px auto' }}>
            Explore nossa seleção exclusiva de veículos revisados com garantia de procedência.
          </p>
        </FadeIn>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px' }}>
        <VehicleInventory initialCars={carros} />
      </main>
      <Footer />
    </div>
  );
}