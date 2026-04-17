module.exports = (sequelize, DataTypes) => {
  return sequelize.define('GuildConfig', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    guildId: { type: DataTypes.STRING, allowNull: false, unique: true },
    adminRoleId: { type: DataTypes.STRING, allowNull: true },
    logChannelId: { type: DataTypes.STRING, allowNull: true },
    paymentChannelId: { type: DataTypes.STRING, allowNull: true },
    defaultCurrency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'BRL' },
    botName: { type: DataTypes.STRING, allowNull: true },
    botLogo: { type: DataTypes.STRING, allowNull: true },
    botCover: { type: DataTypes.STRING, allowNull: true },
    mercadoPagoToken: { type: DataTypes.STRING, allowNull: true }
  });
};
