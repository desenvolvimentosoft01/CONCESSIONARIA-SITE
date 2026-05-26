'use client';

interface BotaoWhatsAppProps {
  carroId: number;
  marca: string;
  modelo: string;
  ano: number;
  telefone: string;
}

export default function BotaoWhatsApp({ carroId, marca, modelo, ano, telefone }: BotaoWhatsAppProps) {
  async function handleWhatsApp() {
    try {
      await fetch(`/api/carros/${carroId}/interesse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carro_id: carroId, marca, modelo, ano }),
      });
    } catch {
      // Silencioso — não bloqueia o usuário
    }

    window.open(
      `https://wa.me/${telefone}?text=Tenho interesse no ${marca} ${modelo}`,
      '_blank'
    );
  }

  return (
    <button
      onClick={handleWhatsApp}
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
        boxShadow: '0 10px 20px rgba(37, 211, 102, 0.2)',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      NEGOCIAR VIA WHATSAPP
    </button>
  );
}
