'use client';

interface ConfirmModalProps {
  titulo?: string;
  mensagem: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  titulo = 'Confirmação',
  mensagem,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false
}: ConfirmModalProps) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>{titulo}</h3>
        </div>
        <p style={styles.message}>{mensagem}</p>
        <div style={styles.actions}>
          <button style={styles.cancelButton} onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button style={styles.confirmButton} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  },
  modal: {
    width: '95%',
    maxWidth: '420px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: '1px solid #e5e7eb'
  },
  header: {
    marginBottom: '10px'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    color: '#111'
  },
  message: {
    color: '#333',
    marginBottom: '20px',
    lineHeight: 1.4
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  cancelButton: {
    padding: '8px 15px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  confirmButton: {
    padding: '8px 15px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer'
  }
};
