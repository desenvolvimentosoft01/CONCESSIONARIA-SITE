'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Toast from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

interface DeletarCarroButtonProps {
  id: number;
}

export function DeletarCarroButton({ id }: DeletarCarroButtonProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{mensagem: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [deletando, setDeletando] = useState(false);

  async function handleDelete() {
    setDeletando(true);
    try {
      const response = await fetch(`/api/carros/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setToast({ mensagem: 'Carro excluído com sucesso!', tipo: 'sucesso' });
        setTimeout(() => {
          router.push('/admin/carros');
          router.refresh();
        }, 900);
      } else {
        setToast({ mensagem: 'Erro ao excluir carro', tipo: 'erro' });
      }
    } catch (error) {
      setToast({ mensagem: 'Erro ao excluir carro', tipo: 'erro' });
    } finally {
      setDeletando(false);
      setMostrarConfirm(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setMostrarConfirm(true)}
        style={styles.botaoExcluir}
      >
        Excluir
      </button>

      {mostrarConfirm && (
        <ConfirmModal
          titulo="Excluir Carro"
          mensagem="Tem certeza de que deseja excluir este carro? Essa ação não pode ser desfeita."
          confirmText="Sim, excluir"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => setMostrarConfirm(false)}
          loading={deletando}
        />
      )}

      {toast && (
        <Toast 
          mensagem={toast.mensagem} 
          tipo={toast.tipo} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}

const styles = {
  botaoExcluir: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};