'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EstoqueLoading() {
  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: '160px 20px 80px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', border: '3px solid #ff6b00', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Carregando veículos...</p>
      </div>
      <Footer />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}