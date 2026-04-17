module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserGuild', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Users', key: 'id' } },
    guildId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING, allowNull: true },
    permissions: { type: DataTypes.STRING, allowNull: false },
    owner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  });
};