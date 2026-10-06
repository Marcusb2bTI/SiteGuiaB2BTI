require('dotenv').config();

const supabase = require('./config/supabase');

async function testar() {
  const arquivo = Buffer.from('Teste do Storage');

  const { data, error } = await supabase.storage
    .from('imagens-guias')
    .upload('teste/teste.txt', arquivo, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    console.error('❌ Erro no Storage:');
    console.error(error);
    return;
  }

  console.log('✅ Upload realizado com sucesso!');
  console.log(data);
}

testar();