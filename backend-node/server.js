require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const assuntosRouter = require('./routes/assuntos');
const guiaRouter = require('./routes/guia');
const cadastrarTutorialRouter = require('./routes/cadastrarTutorial');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Serve as imagens enviadas (igual o "php -S" fazia com a pasta uploads/)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/assuntos', assuntosRouter);
app.use('/api/guia', guiaRouter);
app.use('/api/cadastrar-tutorial', cadastrarTutorialRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});