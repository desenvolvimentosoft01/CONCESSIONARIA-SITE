'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoCarroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');
  const [preview, setPreview] = useState('');
  
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    cor: '',
    placa: '',
    preco: '',
    imagem_url: '',
    descricao: '',
    disponivel: true
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
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
      const response = await fetch('/api/carros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/admin/carros?sucesso=Carro criado!');
      } else {
        const data = await response.json();
        setErro(data.erro || 'Erro ao salvar');
      }
    } catch (error) {
      setErro('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Novo Carro</h1>
      
      {erro && <div style={styles.erro}>❌ {erro}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Upload */}
        <div style={styles.uploadArea}>
          <div style={styles.previewContainer}>
            {preview ? (
              <img src={preview} alt="Preview" style={styles.preview} />
            ) : (
              <div style={styles.previewPlaceholder}>📸 Selecione uma imagem</div>
            )}
          </div>
          
          <label style={styles.uploadButton}>
            {uploading ? 'Enviando...' : 'Escolher imagem do computador'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          <p style={styles.uploadInfo}>JPG, PNG, WEBP até 5MB</p>
        </div>

        {/* Campos */}
        <div style={styles.campo}>
          <label>Marca *</label>
          <input
            type="text"
            value={formData.marca}
            onChange={(e) => setFormData({...formData, marca: e.target.value})}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.campo}>
          <label>Modelo *</label>
          <input
            type="text"
            value={formData.modelo}
            onChange={(e) => setFormData({...formData, modelo: e.target.value})}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.campo}>
          <label>Ano *</label>
          <input
            type="number"
            value={formData.ano}
            onChange={(e) => setFormData({...formData, ano: Number(e.target.value)})}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.campo}>
          <label>Cor *</label>
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
          <label>Placa</label>
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
          <small style={{color: '#666', fontSize: '12px'}}>Formato: ABC-1D23 (7 caracteres)</small>
        </div>
        
        <div style={styles.campo}>
          <label>Preço *</label>
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
          <small style={{color: '#666', fontSize: '12px'}}>Valor exibido: R$ {Number(formData.preco || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</small>
        </div>
        
        <div style={styles.campo}>
          <label>Descrição</label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            rows={4}
            style={styles.textarea}
          />
        </div>
        
        <div style={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.disponivel}
            onChange={(e) => setFormData({...formData, disponivel: e.target.checked})}
          />
          <label>Disponível</label>
        </div>
        
        <button type="submit" disabled={loading || uploading} style={styles.botao}>
          {loading ? 'Salvando...' : 'Salvar Carro'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  titulo: { fontSize: '24px', marginBottom: '20px' },
  erro: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' },
  form: { backgroundColor: 'white', padding: '20px', borderRadius: '10px' },
  uploadArea: { border: '2px dashed #ddd', padding: '20px', textAlign: 'center' as const, marginBottom: '20px' },
  previewContainer: { minHeight: '150px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  preview: { maxWidth: '100%', maxHeight: '150px' },
  previewPlaceholder: { color: '#999' },
  uploadButton: { background: '#007bff', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', display: 'inline-block' },
  uploadInfo: { fontSize: '12px', color: '#999', marginTop: '10px' },
  campo: { marginBottom: '15px' },
  input: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' },
  textarea: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: 'Arial' },
  checkbox: { marginBottom: '20px' },
  botao: { width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};