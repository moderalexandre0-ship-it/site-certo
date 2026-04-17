const { sequelize } = require('./backend/src/config/database');
const { User, Product, Order, Payment, GuildConfig, Log } = require('./backend/src/models');

async function initDatabase() {
  try {
    console.log('Iniciando criação das tabelas...');

    // Dropar tabelas manualmente para evitar constraints
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS Logs');
    await sequelize.query('DROP TABLE IF EXISTS Payments');
    await sequelize.query('DROP TABLE IF EXISTS Orders');
    await sequelize.query('DROP TABLE IF EXISTS Products');
    await sequelize.query('DROP TABLE IF EXISTS GuildConfigs');
    await sequelize.query('DROP TABLE IF EXISTS Users');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Criar tabelas
    await User.sync();
    await Product.sync();
    await Order.sync();
    await Payment.sync();
    await GuildConfig.sync();
    await Log.sync();

    console.log('Tabelas criadas com sucesso!');

    // Criar usuário admin de exemplo
    const adminUser = await User.create({
      discordId: '123456789012345678', // Substitua pelo seu Discord ID
      username: 'Admin',
      email: 'admin@nexospay.com',
      role: 'admin',
      walletBalance: 0
    });

    console.log('Usuário admin criado:', adminUser.toJSON());

    // Criar produto de exemplo
    const exampleProduct = await Product.create({
      name: 'Produto de Exemplo',
      description: 'Este é um produto de exemplo para testar o sistema.',
      priceCents: 1000, // R$ 10,00
      imageUrl: 'https://via.placeholder.com/300x200',
      active: true,
      stock: 100
    });

    console.log('Produto de exemplo criado:', exampleProduct.toJSON());

    console.log('Banco de dados inicializado com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initDatabase();