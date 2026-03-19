'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UploadMultiplasImagens from '@/components/UploadMultiplasImagens';

export default function FormEditarCarro({ carro }: { carro: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');
  const [preview, setPreview] = useState(carro.imagem_url || '');
  
  const [formData, setFormData] = useState({
    marca: carro.marca || '',
    modelo: carro.modelo || '',
    ano: carro.ano || new Date().getFullYear(),
    cor: carro.cor || '',
    placa: carro.placa || '',
    preco: carro.preco || '',
    imagem_url: carro.imagem_url || '',
    descricao: carro.descricao || '',
    disponivel: carro.disponivel ?? true
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setErro('');

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, imagem_url: data.imagem_url }));
      } else {
        setErro(data.erro || 'Erro no upload');
      }
    } catch (error) {
      setErro('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const response = await fetch('/api/carros/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: carro.id,
          ...formData
        })
      });

      if (response.ok) {
        router.push('/admin/carros?sucesso=Carro atualizado!');
      } else {
        const data = await response.json();
        setErro(data.erro || 'Erro ao atualizar');
      }
    } catch (error) {
      setErro('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* CABEÇALHO COM BOTÃO VOLTAR */}
      <div style={styles.header}>
        <Link href="/admin/carros" style={styles.botaoVoltar}>
          ← Voltar para lista
        </Link>
        <h1 style={styles.titulo}>Editar Carro #{carro.id}</h1>
      </div>
      
      {erro && (
        <div style={styles.erro}>
          ❌ {erro}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* ÁREA DE UPLOAD DA IMAGEM PRINCIPAL */}
        <div style={styles.uploadCard}>
          <h3 style={styles.cardTitulo}>📸 Imagem Principal</h3>
          <div style={styles.uploadArea}>
            <div style={styles.previewContainer}>
              {preview ? (
                <img src={preview} alt="Preview" style={styles.preview} />
              ) : (
                <div style={styles.previewPlaceholder}>
                  <span style={styles.previewIcon}>📷</span>
                  <p>Nenhuma imagem selecionada</p>
                </div>
              )}
            </div>
            
            <label style={uploading ? styles.uploadButtonDisabled : styles.uploadButton}>
              {uploading ? 'Enviando...' : 'Escolher imagem'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* DADOS DO CARRO */}
        <div style={styles.dadosCard}>
          <h3 style={styles.cardTitulo}>🚗 Dados do Veículo</h3>
          
          <div style={styles.grid}>
            <div style={styles.campo}>
              <label style={styles.label}>Marca *</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({...formData, marca: e.target.value})}
                style={styles.input}
                required
                placeholder="Ex: Toyota, Honda, Fiat"
              />
            </div>
            
            <div style={styles.campo}>
              <label style={styles.label}>Modelo *</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                style={styles.input}
                required
                placeholder="Ex: Corolla, HR-V, Pulse"
              />
            </div>
            
            <div style={styles.campo}>
              <label style={styles.label}>Ano *</label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({...formData, ano: Number(e.target.value)})}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.campo}>
              <label style={styles.label}>Cor *</label>
              <input
                type="text"
                value={formData.cor}
                onChange={(e) => setFormData({...formData, cor: e.target.value})}
                style={styles.input}
                placeholder="Ex: Preto, Branco, Prata"
                required
              />
            </div>
            
            <div style={styles.campo}>
              <label style={styles.label}>Placa</label>
              <input
                type="text"
                value={formData.placa ? `${formData.placa.slice(0, 3)}${formData.placa.length > 3 ? '-' : ''}${formData.placa.slice(3)}` : ''}
                onChange={(e) => {
                  const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setFormData({...formData, placa: valor});
                }}
                style={styles.input}
                placeholder="ABC-1D23"
                maxLength={8}
              />
              <small style={{color: '#666', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                Formato: ABC-1D23 (7 caracteres)
              </small>
            </div>
            
            <div style={styles.campo}>
              <label style={styles.label}>Preço * (R$)</label>
              <input
                type="text"
                value={formData.preco}
                onChange={(e) => {
                  const valor = e.target.value.replace(/\D/g, '');
                  const valorFormatado = (Number(valor) / 100).toFixed(2);
                  setFormData({...formData, preco: valorFormatado});
                }}
                placeholder="R$ 0,00"
                style={styles.input}
                required
              />
              <small style={{color: '#666', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                Valor: R$ {Number(formData.preco || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </small>
            </div>
            
            <div style={styles.campoFull}>
              <label style={styles.label}>Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows={4}
                style={styles.textarea}
                placeholder="Descreva as características do veículo..."
              />
            </div>
          </div>

          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={formData.disponivel}
              onChange={(e) => setFormData({...formData, disponivel: e.target.checked})}
              style={styles.checkbox}
              id="disponivel"
            />
            <label htmlFor="disponivel" style={styles.checkboxLabel}>
              Veículo disponível para venda
            </label>
          </div>
        </div>
      </form>

      {/* SEÇÃO DE MÚLTIPLAS IMAGENS */}
      <div style={styles.multiImagensCard}>
        <h3 style={styles.cardTitulo}>🖼️ Galeria de Fotos</h3>
        <UploadMultiplasImagens carroId={carro.id} />
      </div>

      {/* BOTÕES DE AÇÃO NO FINAL */}
      <div style={styles.acoes}>
        <button
          onClick={handleSubmit}
          disabled={loading || uploading}
          style={loading || uploading ? styles.botaoSalvarDisabled : styles.botaoSalvar}
        >
          {loading ? '💾 Salvando...' : '💾 Salvar Alterações'}
        </button>
        
        <Link href="/admin/carros" style={styles.botaoCancelar}>
          Cancelar
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    backgroundColor: 'white',
    padding: '15px 20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  botaoVoltar: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'background-color 0.3s'
  },
  titulo: {
    fontSize: '20px',
    color: '#333',
    margin: 0
  },
  erro: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  uploadCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  dadosCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  multiImagensCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginTop: '20px'
  },
  cardTitulo: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '2px solid #ff6b00'
  },
  uploadArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '15px'
  },
  previewContainer: {
    width: '100%',
    height: '200px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #ddd'
  },
  preview: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const
  },
  previewPlaceholder: {
    textAlign: 'center' as const,
    color: '#999'
  },
  previewIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '10px'
  },
  uploadButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    border: 'none',
    transition: 'background-color 0.3s'
  },
  uploadButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    borderRadius: '5px',
    cursor: 'not-allowed',
    fontSize: '14px',
    border: 'none',
    opacity: 0.7
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  campo: {
    marginBottom: '10px'
  },
  campoFull: {
    gridColumn: 'span 2',
    marginBottom: '10px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#666',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.3s'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    fontFamily: 'Arial',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    transition: 'border-color 0.3s'
  },
  checkboxContainer: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer'
  },
  acoes: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  botaoSalvar: {
    flex: 2,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  botaoSalvarDisabled: {
    flex: 2,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  botaoCancelar: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    textAlign: 'center' as const,
    borderRadius: '5px',
    fontSize: '16px',
    transition: 'background-color 0.3s'
  },

    // Media Queries (Responsividade)
    
  '@media (max-width: 768px)': {
    header: {
      flexDirection: 'column',
      gap: '15px'
    },
    grid: {
      gridTemplateColumns: '1fr'
    },
    campoFull: {
      gridColumn: '1'
    },
    previewContainer: {
      height: '150px'
    },
    acoes: {
      flexDirection: 'column',
      gap: '10px'
    }
  },

  '@media (max-width: 480px)': {
    container: {
      padding: '10px'
    },
    titulo: {
      fontSize: '20px'
    },
    label: {
      fontSize: '12px'
    },
    input: {
      padding: '8px',
      fontSize: '12px'
    },
    textarea: {
      padding: '8px',
      fontSize: '12px'
    },
    botaoSalvar: {
      fontSize: '14px'
    },
    botaoCancelar: {
      fontSize: '14px'
    }
  }
};