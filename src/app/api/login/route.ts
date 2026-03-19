import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('🔵 [LOGIN] Tentativa de login');
  
  try {
    const { email, senha } = await request.json();
    
    console.log('📧 Email:', email);

    // Busca o usuário no banco
    const usuarios = await query(
      'SELECT * FROM TAB_USUARIO WHERE email = $1',
      [email]
    );

    console.log('👤 Usuários encontrados:', usuarios.length);

    if (usuarios.length === 0) {
      console.log('❌ Usuário não encontrado');
      return NextResponse.json(
        { erro: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    const usuario = usuarios[0];
    
    // Compara a senha (em produção, use bcrypt)
    if (usuario.senha !== senha) {
      console.log('❌ Senha incorreta');
      return NextResponse.json(
        { erro: 'Senha incorreta' },
        { status: 401 }
      );
    }

    console.log('✅ Login bem-sucedido:', usuario.nome);
    
    // Cria resposta com cookie
    const response = NextResponse.json({
      sucesso: true,
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    });
    
    // Define cookie com nome do usuário (válido por 7 dias)
    response.cookies.set('admin_usuario', usuario.nome, {
      httpOnly: false, // Permite acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    });
    
    return response;

  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}