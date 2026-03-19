import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
  console.log('🔵 [UPLOAD] Iniciando upload...');
  
  // Configura Cloudinary diretamente aqui
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  console.log('🔧 [UPLOAD] Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'definida' : 'indefinida',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'definida' : 'indefinida',
  });
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📦 [UPLOAD] Arquivo recebido:', file?.name, file?.type, file?.size);
    
    if (!file) {
      console.log('❌ [UPLOAD] Nenhum arquivo enviado');
      return NextResponse.json(
        { erro: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    console.log('🔍 [UPLOAD] Tipo detectado - Imagem:', isImage, 'Vídeo:', isVideo);

    if (!isImage && !isVideo) {
      console.log('❌ [UPLOAD] Tipo de arquivo inválido');
      return NextResponse.json(
        { erro: 'Arquivo deve ser imagem ou vídeo' },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    console.log('📏 [UPLOAD] Tamanho:', file.size, 'Máximo:', maxSize);
    
    if (file.size > maxSize) {
      console.log('❌ [UPLOAD] Arquivo muito grande');
      return NextResponse.json(
        { erro: `Arquivo muito grande. Máximo ${isVideo ? '100MB' : '10MB'}` },
        { status: 400 }
      );
    }

    // Converte para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload para o Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: isVideo ? 'video' : 'image',
          folder: 'concessionaria',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const uploadResult = result as any;
    console.log('✅ [UPLOAD] Upload concluído no Cloudinary');
    console.log('🔗 [UPLOAD] URL gerada:', uploadResult.secure_url);
    
    return NextResponse.json({ 
      sucesso: true, 
      imagem_url: uploadResult.secure_url
    });
    
  } catch (error) {
    console.error('❌ [UPLOAD] Erro:', error);
    return NextResponse.json(
      { erro: 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}