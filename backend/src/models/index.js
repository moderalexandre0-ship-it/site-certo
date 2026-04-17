const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const UserModel = require('./User');
const ProductModel = require('./Product');
const OrderModel = require('./Order');
const PaymentModel = require('./Payment');
const GuildConfigModel = require('./GuildConfig');
const LogModel = require('./Log');
const UserGuildModel = require('./UserGuild');

const User = UserModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);
const GuildConfig = GuildConfigModel(sequelize, DataTypes);
const Log = LogModel(sequelize, DataTypes);
const UserGuild = UserGuildModel(sequelize, DataTypes);

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Order, { foreignKey: 'productId' });
Order.belongsTo(Product, { foreignKey: 'productId' });
Order.hasOne(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });
GuildConfig.hasMany(Log, { foreignKey: 'guildId', sourceKey: 'guildId' });
Log.belongsTo(GuildConfig, { foreignKey: 'guildId', targetKey: 'guildId' });
User.hasMany(UserGuild, { foreignKey: 'userId' });
UserGuild.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  Payment,
  GuildConfig,
  Log,
  UserGuild
};
