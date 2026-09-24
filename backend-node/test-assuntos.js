require('dotenv').config();

const pool = require('./config/database');

async function testar() {
    try {
        const { rows } = await pool.query(`
            SELECT *
            FROM assuntos
            ORDER BY ordem ASC
        `);

        console.log('✅ Dados encontrados:');
        console.table(rows);

    } catch (err) {
        console.error('❌ Erro ao buscar assuntos:', err.message);

    } finally {
        await pool.end();
    }
}

testar();