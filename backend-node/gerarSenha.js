const bcrypt = require('bcrypt');

const senha = 'b2bti@12345';

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log('Hash da senha:');
  console.log(hash);
});