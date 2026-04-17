const express = require('express');
const { Order, Product, Payment, User } = require('../models');
const { ensureAuthenticated, isBotRequest } = require('../middleware/authenticate');
const { createMercadoPagoOrder } = require('../services/mercadoPago');
const { logAction } = require('../services/discordNotifier');
const router = express.Router();

router.get('/', ensureAuthenticated, async (req, res, next) => {
  try {
    if (isBotRequest(req) || req.user.role === 'admin') {
      const where = {};
      if (req.query.guildId) {
        where.guildId = req.query.guildId;
      }
      const orders = await Order.findAll({ where, include: [Product, Payment] });
      return res.json(orders);
    }

    const user = await User.findOne({ where: { discordId: req.user.id } });
    if (!user) {
      return res.json([]);
    }
    const orders = await Order.findAll({ where: { userId: user.id }, include: [Product, Payment] });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/me', ensureAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { discordId: req.user.id } });
    if (!user) {
      return res.json([]);
    }
    const orders = await Order.findAll({ where: { userId: user.id }, include: [Product, Payment] });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.post('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const { productId, quantity = 1, guildId } = req.body;
    const product = await Product.findByPk(productId);
    if (!product || !product.active) {
      return res.status(404).json({ message: 'Produto indisponível' });
    }
    let user = await User.findOne({ where: { discordId: req.user.id } });
    if (!user) {
      user = await User.create({
        discordId: req.user.id,
        username: 'Unknown',
        email: null,
        walletBalance: 0,
        role: 'user'
      });
    }
    const orderTotal = product.priceCents * quantity;
    const order = await Order.create({
      userId: user.id,
      productId,
      guildId: guildId || null,
      quantity,
      totalCents: orderTotal,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    const payment = await createMercadoPagoOrder(order, product, user);
    await order.update({ paymentStatus: payment.status });

    await logAction({
      guildId: guildId || null,
      userId: user.id,
      action: 'create_order',
      details: `Pedido #${order.id} criado para produto ${product.name}`
    });

    res.status(201).json({ order, payment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
