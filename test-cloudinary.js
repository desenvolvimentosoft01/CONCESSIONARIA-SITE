const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dji0ipb4s',
  api_key: '115934637111411',
  api_secret: 'LfKxYUVwIjB4Nk-gaPqN4Aoylso',
});

console.log('Testando credenciais Cloudinary...\n');

cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary conectado com sucesso!');
    console.log('Resultado:', result);
  })
  .catch(error => {
    console.log('❌ Erro ao conectar:');
    console.log('Mensagem:', error.message);
    console.log('HTTP Code:', error.http_code);
    console.log('Detalhes:', error.error);
  });
