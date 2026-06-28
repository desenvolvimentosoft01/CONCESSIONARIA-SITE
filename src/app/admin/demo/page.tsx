'use client';

import { useEffect, useState } from 'react';
import styles from './admin-demo.module.css';

interface DemoToken {
  id: number;
  token: string;
  cliente: string;
  dias: number;
  inicio: string;
  expiracao: string;
  ativo: boolean;
  criado_em: string;
}

function statusToken(t: DemoToken): 'ativo' | 'expirado' | 'desativado' {
  if (!t.ativo) return 'desativado';
  if (new Date(t.expiracao) < new Date()) return 'expirado';
  return 'ativo';
}

function diasRestantes(t: DemoToken): number {
  const diff = new Date(t.expiracao).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function AdminDemoPage() {
  const [tokens, setTokens] = useState<DemoToken[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoCliente, setNovoCliente] = useState('');
  const [novoDias, setNovoDias] = useState(7);
  const [criando, setCriando] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  async function carregar() {
    setCarregando(true);
    const res = await fetch('/api/demo/tokens');
    const data = await res.json();
    setTokens(data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function criarToken() {
    if (!novoCliente.trim()) return;
    setCriando(true);
    await fetch('/api/demo/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente: novoCliente.trim(), dias: novoDias }),
    });
    setNovoCliente('');
    setNovoDias(7);
    setCriando(false);
    carregar();
  }

  async function acao(id: number, acao: string, dias?: number) {
    await fetch(`/api/demo/tokens/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, dias }),
    });
    setFeedback(
      acao === 'estender'  ? '+1 dia adicionado!' :
      acao === 'reativar'  ? 'Demo reativado por 7 dias!' :
      'Demo desativado.'
    );
    setTimeout(() => setFeedback(''), 2500);
    carregar();
  }

  async function deletar(id: number) {
    if (!confirm('Remover este token permanentemente?')) return;
    await fetch(`/api/demo/tokens/${id}`, { method: 'DELETE' });
    carregar();
  }

  function copiarLink(t: DemoToken) {
    const link = `${baseUrl}/?token=${t.token}`;
    navigator.clipboard.writeText(link);
    setLinkCopiado(t.id);
    setTimeout(() => setLinkCopiado(null), 2000);
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return (
      <div className={styles.pagina}>
        <p className={styles.aviso}>Esta página só está disponível em modo demo (<code>NEXT_PUBLIC_DEMO_MODE=true</code>).</p>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <h1 className={styles.titulo}>Gerenciar Demos</h1>
      <p className={styles.subtitulo}>Crie links de acesso para cada cliente e controle a validade individualmente.</p>

      {feedback && <div className={styles.feedbackBanner}>{feedback}</div>}

      {/* Formulário novo token */}
      <div className={styles.card}>
        <h2 className={styles.cardTitulo}>Novo link de demo</h2>
        <div className={styles.formRow}>
          <input
            className={styles.input}
            placeholder="Nome do cliente"
            value={novoCliente}
            onChange={e => setNovoCliente(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && criarToken()}
          />
          <div className={styles.diasWrap}>
            <label className={styles.labelDias}>Dias</label>
            <input
              className={styles.inputDias}
              type="number"
              min={1}
              max={90}
              value={novoDias}
              onChange={e => setNovoDias(Number(e.target.value))}
            />
          </div>
          <button className={styles.btnCriar} onClick={criarToken} disabled={criando || !novoCliente.trim()}>
            {criando ? 'Criando…' : 'Gerar link'}
          </button>
        </div>
      </div>

      {/* Lista de tokens */}
      <div className={styles.card}>
        <h2 className={styles.cardTitulo}>Tokens ativos</h2>

        {carregando ? (
          <p className={styles.vazio}>Carregando…</p>
        ) : tokens.length === 0 ? (
          <p className={styles.vazio}>Nenhum token criado ainda.</p>
        ) : (
          <div className={styles.lista}>
            {tokens.map(t => {
              const st = statusToken(t);
              const dias = diasRestantes(t);
              const link = `${baseUrl}/?token=${t.token}`;

              return (
                <div key={t.id} className={`${styles.item} ${styles[st]}`}>
                  <div className={styles.itemHeader}>
                    <span className={styles.clienteNome}>{t.cliente}</span>
                    <span className={`${styles.badge} ${styles['badge_' + st]}`}>
                      {st === 'ativo' ? `${dias} dia${dias !== 1 ? 's' : ''}` : st}
                    </span>
                  </div>

                  <div className={styles.linkRow}>
                    <span className={styles.linkTexto}>{link}</span>
                    <button className={styles.btnCopiar} onClick={() => copiarLink(t)}>
                      {linkCopiado === t.id ? '✓ Copiado' : 'Copiar link'}
                    </button>
                  </div>

                  <div className={styles.itemInfo}>
                    <span>Expira: {new Date(t.expiracao).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className={styles.acoes}>
                    {st === 'ativo' && (
                      <button className={styles.btnAcao} onClick={() => acao(t.id, 'estender', 1)}>
                        +1 dia
                      </button>
                    )}
                    {(st === 'expirado' || st === 'desativado') && (
                      <button className={`${styles.btnAcao} ${styles.btnReativar}`} onClick={() => acao(t.id, 'reativar', 7)}>
                        Reativar 7 dias
                      </button>
                    )}
                    {st === 'ativo' && (
                      <button className={`${styles.btnAcao} ${styles.btnDesativar}`} onClick={() => acao(t.id, 'desativar')}>
                        Desativar
                      </button>
                    )}
                    <button className={`${styles.btnAcao} ${styles.btnDeletar}`} onClick={() => deletar(t.id)}>
                      Remover
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
