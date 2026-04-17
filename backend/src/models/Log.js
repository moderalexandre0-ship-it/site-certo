module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Log', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    guildId: { type: DataTypes.STRING, allowNull: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.TEXT, allowNull: true },
    level: { type: DataTypes.STRING, allowNull: false, defaultValue: 'info' }
  });
};
