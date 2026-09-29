const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {

  // Pega o cabeçalho Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      erro: 'Token não informado'
    });
  }


  // Esperamos:
  // Authorization: Bearer TOKEN
  const partes = authHeader.split(' ');

  if (
    partes.length !== 2 ||
    partes[0] !== 'Bearer'
  ) {
    return res.status(401).json({
      erro: 'Formato do token inválido'
    });
  }


  const token = partes[1];


  try {

    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Guarda os dados do usuário na requisição
    req.usuario = usuario;

    next();

  } catch (err) {

    return res.status(401).json({
      erro: 'Token inválido ou expirado'
    });

  }
}


module.exports = autenticar;