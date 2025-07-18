const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const { optionalAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao banco
connectDatabase();

// Configurações do Express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware global para templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.errors = req.session.errors || [];
  res.locals.success = req.session.success || null;

  // Limpar mensagens da sessão
  delete req.session.errors;
  delete req.session.success;

  next();
});

// Rotas básicas
app.get('/', optionalAuth, (req, res) => {
  res.render('index', {
    title: 'Football Championship Platform',
    user: req.user
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Rotas serão adicionadas aqui posteriormente
// app.use('/auth', require('./routes/web/auth'));
// app.use('/api/auth', require('./routes/api/auth'));

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }

  res.status(500).render('error', {
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }

  res.status(404).render('error', {
    error: 'Página não encontrada',
    message: 'A página que você procura não existe'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;