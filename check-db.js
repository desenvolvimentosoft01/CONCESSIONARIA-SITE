const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Dm1N@localhost:5432/CONCESSIONARIA'
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('✅ Conexão com banco bem-sucedida!');
    console.log('📊 Tabelas encontradas:');
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma tabela encontrada! O banco está vazio.');
    } else {
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
