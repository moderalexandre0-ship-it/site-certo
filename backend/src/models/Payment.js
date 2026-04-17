module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    externalPaymentId: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    method: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pix' },
    amountCents: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'BRL' },
    qrCode: { type: DataTypes.TEXT, allowNull: true },
    pixCopyPaste: { type: DataTypes.TEXT, allowNull: true },
    checkoutLink: { type: DataTypes.TEXT, allowNull: true }
  });
};
