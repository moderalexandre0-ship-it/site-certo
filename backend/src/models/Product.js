module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Users', key: 'id' } },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    priceCents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'BRL' },
    stock: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 9999 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    deliveryType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'automatica' },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    productColor: { type: DataTypes.STRING(7), allowNull: true, defaultValue: '#3b82f6' },
    announcementGuildId: { type: DataTypes.STRING, allowNull: true },
    announcementChannelId: { type: DataTypes.STRING, allowNull: true },
    announced: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    announcedAt: { type: DataTypes.DATE, allowNull: true }
  });
};
