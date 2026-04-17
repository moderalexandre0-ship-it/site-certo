const axios = require('axios');
const { Payment, GuildConfig } = require('../models');

async function createMercadoPagoOrder(order, product, user) {
  // Buscar token do Mercado Pago da configuração da guilda
  const config = await GuildConfig.findOne({ where: { guildId: order.guildId } });
  const accessToken = config?.mercadoPagoToken || process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Mercado Pago token não configurado para esta guilda');
  }

  const mercadoPagoClient = axios.create({
    baseURL: 'https://api.mercadopago.com',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const body = {
    transaction_amount: (order.totalCents / 100).toFixed(2),
    description: product.description || product.name,
    payment_method_id: 'pix',
    payer: {
      email: user.email || `buyer-${user.discordId}@nexospay.local`,
      first_name: user.username
    }
  };

  const payment = await Payment.create({
    orderId: order.id,
    status: 'pending',
    method: 'pix',
    amountCents: order.totalCents,
    currency: product.currency
  });

  try {
    const response = await mercadoPagoClient.post('/v1/payments', body);
    const data = response.data;
    await payment.update({
      externalPaymentId: data.id?.toString(),
      status: data.status || 'pending',
      qrCode: data.point_of_interaction?.transaction_data?.qr_code || null,
      pixCopyPaste: data.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      checkoutLink: data.init_point || data.sandbox_init_point || null
    });
    return payment;
  } catch (error) {
    return payment;
  }
}

module.exports = { createMercadoPagoOrder };
