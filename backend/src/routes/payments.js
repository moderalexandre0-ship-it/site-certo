const express = require('express');
const { Payment, Order } = require('../models');
const { ensureAuthenticated, isBotRequest } = require('../middleware/authenticate');
const router = express.Router();

router.get('/', ensureAuthenticated, async (req, res, next) => {
  try {
    if (!isBotRequest(req) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso restrito' });
    }
    const payments = await Payment.findAll({ include: [Order] });
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

router.get('/:orderId', ensureAuthenticated, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ where: { orderId: req.params.orderId } });
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

router.post('/confirm', ensureAuthenticated, async (req, res, next) => {
  try {
    const { orderId, externalPaymentId, status } = req.body;
    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    await payment.update({ externalPaymentId, status });
    if (status === 'approved') {
      const order = await Order.findByPk(orderId);
      await order.update({ status: 'completed', paymentStatus: 'paid' });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
