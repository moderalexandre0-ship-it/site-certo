const { sequelize, User } = require('../models');
const { ensureDatabaseExists } = require('../config/database');

async function init() {
  try {
    await ensureDatabaseExists();
    await sequelize.sync({ alter: true });
    console.log('Banco inicializado com sucesso.');
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      const created = await User.create({
        discordId: 'admin-0000',
        username: 'NexosPayAdmin',
        email: null,
        role: 'admin',
        walletBalance: 0
      });
      console.log('Usuário admin criado:', created.discordId);
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro ao inicializar banco:', err);
    process.exit(1);
  }
}

init();
