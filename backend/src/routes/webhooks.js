const express = require('express');
const { Payment, Order } = require('../models');
const { logAction } = require('../services/discordNotifier');
const router = express.Router();

router.post('/mercadopago', async (req, res, next) => {
  try {
    const expectedToken = process.env.DISCORD_WEBHOOK_SECRET;
    const token = req.headers['x-webhook-token'] || req.body.token;
    if (!token || token !== expectedToken) {
      return res.status(401).json({ message: 'Webhook não autorizado' });
    }

    const { externalPaymentId, status, orderId, qrCode, pixCopyPaste } = req.body;
    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    await payment.update({
      externalPaymentId: externalPaymentId || payment.externalPaymentId,
      status: status || payment.status,
      qrCode: qrCode || payment.qrCode,
      pixCopyPaste: pixCopyPaste || payment.pixCopyPaste
    });

    if (status === 'approved') {
      const order = await Order.findByPk(orderId);
      await order.update({ status: 'completed', paymentStatus: 'paid' });
      await logAction({ guildId: order.guildId, userId: order.userId, action: 'payment_approved', details: `Pagamento aprovado para pedido ${orderId}` });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
