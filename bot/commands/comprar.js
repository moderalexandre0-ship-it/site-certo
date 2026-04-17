
const { SlashCommandBuilder } = require('discord.js');
const { createApiClient } = require('../services/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('comprar')
    .setDescription('Inicia a compra de um produto na NexosPay.')
    .addIntegerOption(option => option.setName('produto_id').setDescription('ID do produto').setRequired(true))
    .addIntegerOption(option => option.setName('quantidade').setDescription('Quantidade').setRequired(false)),

  async execute(interactionOrMessage, { apiBaseUrl, args = [] } = {}) {
    const isInteraction = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
    const [productIdArg, quantityArg] = args;
    const productId = isInteraction ? interactionOrMessage.options.getInteger('produto_id') : Number(productIdArg);
    const quantity = isInteraction ? interactionOrMessage.options.getInteger('quantidade') || 1 : Number(quantityArg) || 1;

    if (!productId || Number.isNaN(productId)) {
      const message = 'Uso: $comprar <produto_id> [quantidade]';
      return isInteraction ? interactionOrMessage.reply({ content: message, flags: 64 }) : interactionOrMessage.reply(message);
    }

    const api = createApiClient(apiBaseUrl, user.id);
    try {
      if (isInteraction) await interactionOrMessage.deferReply({ flags: 64 });
      const response = await api.post('/orders', { productId, quantity, guildId: interactionOrMessage.guildId });
      const { order, payment } = response.data;
      const replyText = `Pedido criado com sucesso!\nPedido #${order.id}\nTotal: R$ ${(order.totalCents / 100).toFixed(2)}\nAcesse o link de pagamento: ${payment.checkoutLink || 'não disponível'}\nUse o PIX: ${payment.pixCopyPaste || 'não disponível'}`;
      return isInteraction ? interactionOrMessage.editReply(replyText) : interactionOrMessage.reply(replyText);
    } catch (error) {
      console.error(error);
      const replyText = 'Erro ao criar o pedido. Verifique se o produto existe e tente novamente.';
      return isInteraction ? interactionOrMessage.editReply(replyText) : interactionOrMessage.reply(replyText);
    }
  }
};
