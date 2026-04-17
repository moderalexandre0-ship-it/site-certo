const express = require('express');
const { Product, User } = require('../models');
const { ensureAuthenticated, isBotRequest } = require('../middleware/authenticate');
const router = express.Router();

async function resolveAuthenticatedUserId(req) {
  if (!req.user) return null;
  const rawId = req.user.id;
  if (typeof rawId === 'number') return rawId;
  if (typeof rawId === 'string') {
    if (/^\d+$/.test(rawId) && rawId.length <= 10) {
      return Number(rawId);
    }
    let user = await User.findOne({ where: { discordId: rawId } });
    if (!user) {
      user = await User.create({
        discordId: rawId,
        username: 'Discord User',
        email: null,
        walletBalance: 0,
        role: 'user'
      });
    }
    return user.id;
  }
  return rawId;
}

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.includeInactive !== 'true') {
      where.active = true;
    }
    if (req.user) {
      where.userId = await resolveAuthenticatedUserId(req);
    }
    const products = await Product.findAll({ where });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.post('/', ensureAuthenticated, async (req, res, next) => {
  try {
    const userId = await resolveAuthenticatedUserId(req);
    const { name, description, priceCents, stock, deliveryType, productColor, imageUrl, announcementGuildId, announcementChannelId } = req.body;
    const product = await Product.create({
      userId,
      name,
      description,
      priceCents,
      stock: stock || 9999,
      deliveryType: deliveryType || 'automatica',
      productColor: productColor || '#3b82f6',
      imageUrl: imageUrl || null,
      active: true,
      announcementGuildId: announcementGuildId || null,
      announcementChannelId: announcementChannelId || null,
      announced: false
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    const userId = await resolveAuthenticatedUserId(req);
    if (req.user.role !== 'admin' && product.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    await product.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const userId = await resolveAuthenticatedUserId(req);
    if (!isBotRequest(req) && req.user.role !== 'admin' && product.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', ensureAuthenticated, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const userId = await resolveAuthenticatedUserId(req);
    if (!isBotRequest(req) && req.user.role !== 'admin' && product.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const {
      name,
      description,
      priceCents,
      price,
      stock,
      deliveryType,
      productColor,
      imageUrl,
      announcementGuildId,
      announcementChannelId,
      active
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (priceCents !== undefined) updates.priceCents = Number(priceCents);
    if (price !== undefined) updates.priceCents = Math.round(Number(price) * 100);
    if (stock !== undefined) updates.stock = Number(stock);
    if (deliveryType !== undefined) updates.deliveryType = deliveryType;
    if (productColor !== undefined) updates.productColor = productColor;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (announcementGuildId !== undefined) updates.announcementGuildId = announcementGuildId;
    if (announcementChannelId !== undefined) updates.announcementChannelId = announcementChannelId;
    if (active !== undefined) updates.active = active;

    await product.update(updates);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/announce', ensureAuthenticated, async (req, res, next) => {
  try {
    const { channelId } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const userId = await resolveAuthenticatedUserId(req);
    if (req.user.role !== 'admin' && product.userId !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    try {
      // Usar fetch nativo do Node.js 18+
      const discordToken = process.env.DISCORD_TOKEN;
      
      const headers = {
        'Authorization': `Bot ${discordToken}`,
        'Content-Type': 'application/json'
      };

      // Obter o canal para verificar se existe
      const channelResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        headers
      });

      if (!channelResponse.ok) {
        return res.status(400).json({ message: 'Canal não encontrado ou sem permissão' });
      }

      // Criar embed para o produto
      const embed = {
        title: `🛒 ${product.name}`,
        description: product.description,
        fields: [
          { name: '💰 Preço', value: `R$ ${(product.priceCents / 100).toFixed(2)}`, inline: true },
          { name: '📦 Estoque', value: `${product.stock}`, inline: true },
          { name: '🔄 Entrega', value: product.deliveryType || 'automática', inline: true }
        ],
        color: parseInt(product.productColor?.replace('#', '') || '3b82f6', 16),
        footer: { text: `Produto #${product.id} • NexosPay` }
      };

      // Adicionar imagem se existir
      if (product.imageUrl) {
        embed.image = { url: product.imageUrl };
      }

      // Enviar mensagem com botão
      const messageBody = {
        content: '**Novo produto disponível!** 🎉',
        embeds: [embed],
        components: [{
          type: 1,
          components: [{
            type: 2,
            style: 1,
            label: '🛒 Comprar',
            custom_id: `buy_${product.id}`
          }]
        }]
      };

      const sendResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageBody)
      });

      if (!sendResponse.ok) {
        const error = await sendResponse.text();
        console.error('Erro ao enviar mensagem:', error);
        return res.status(400).json({ message: 'Erro ao enviar mensagem ao canal' });
      }

      const message = await sendResponse.json();

      // Fixar a mensagem
      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${message.id}/pin`, {
        method: 'POST',
        headers
      }).catch(() => {
        // Ignorar erros ao fixar (pode não ter permissão)
      });

      // Marcar como anunciado
      await product.update({ announced: true });

      res.json({ success: true, messageId: message.id });
    } catch (error) {
      console.error('Erro ao anunciar produto:', error);
      res.status(500).json({ message: 'Erro ao anunciar produto no Discord' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
