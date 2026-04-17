const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const { ensureDatabaseExists } = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();
require('./config/passport');

const app = express();
const port = process.env.BACKEND_PORT || 3000;

// Store de sessão em memória
const sessionStore = new session.MemoryStore();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuração de sessão
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'nexospay-secret-key-2024',
  resave: true,
  saveUninitialized: true,
  name: 'nexospay.sid',
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para garantir que req.session sempre existe
app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(errorHandler);

async function startServer() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('MySQL conectado com sucesso.');
    await sequelize.sync();
    console.log('Tabelas sincronizadas.');
    const server = app.listen(port, () => console.log(`NexosPay backend rodando em http://localhost:${port}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${port} já em uso. Pare o processo existente ou defina BACKEND_PORT diferente no .env.`);
      } else {
        console.error('Erro no servidor:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
}

startServer();
