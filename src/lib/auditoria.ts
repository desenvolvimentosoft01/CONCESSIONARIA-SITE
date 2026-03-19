import { query } from './db';

interface AuditoriaLog {
  usuario: string;
  acao: 'CREATE' | 'UPDATE' | 'DELETE';
  tabela: string;
  registroId?: number;
  dadosAntes?: any;
  dadosDepois?: any;
}

export async function registrarAuditoria(log: AuditoriaLog) {
  try {
    await query(
      `INSERT INTO TAB_AUDITORIA 
       (usuario, acao, tabela, registro_id, dados_antes, dados_depois)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        log.usuario,
        log.acao,
        log.tabela,
        log.registroId || null,
        log.dadosAntes ? JSON.stringify(log.dadosAntes) : null,
        log.dadosDepois ? JSON.stringify(log.dadosDepois) : null,
      ]
    );
    console.log('📝 [AUDITORIA] Log registrado:', log.acao, log.tabela);
  } catch (error) {
    console.error('❌ [AUDITORIA] Erro ao registrar:', error);
  }
}

export function getClientInfo(request: Request) {
  // Pega o nome do usuário do cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const usuarioMatch = cookieHeader.match(/admin_usuario=([^;]+)/);
  const usuario = usuarioMatch ? decodeURIComponent(usuarioMatch[1]) : 'Sistema';
  
  return { usuario };
}
