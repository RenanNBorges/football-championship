const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const methodOverride = require('method-override');
require('dotenv').config();

const { connectDatabase } = require('./config/database');

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
app.use(methodOverride('_method'));

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

  delete req.session.errors;
  delete req.session.success;

  next();
});

// Rotas Web
app.use('/', require('./routes/web/index'));
app.use('/auth', require('./routes/web/auth'));
app.use('/teams', require('./routes/web/