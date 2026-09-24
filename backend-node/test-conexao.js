require('dotenv').config();
const pool = require('./config/database');

async function testar() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('✅ Conectado com sucesso! Hora do servidor Supabase:', rows[0].now);
  } catch (err) {
    console.error('❌ Falha na conexão:', err.message);
  } finally {
    await pool.end();
  }
}

testar();