const { SlashCommandBuilder } = require('discord.js');
const { createApiClient } = require('../services/apiClient');

module.exports = {
  data: new SlashCommandBuilder().setName('ver-pedidos').setDescription('Exibe os pedidos recentes do usuário.'),
  async execute(interactionOrMessage, { apiBaseUrl, args = [] } = {}) {
    const isInteraction = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
    if (isInteraction) await interactionOrMessage.deferReply({ flags: 64 });
    const api = createApiClient(apiBaseUrl, user.id);
    try {
      const response = await api.get('/orders/me');
      const orders = response.data;
      if (!Array.isArray(orders) || orders.length === 0) {
        const message = 'Você não possui pedidos registrados.';
        return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
      }
      const lines = orders.slice(0, 5).map(order => `#${order.id} - ${order.status} - R$ ${(order.totalCents / 100).toFixed(2)}`);
      const replyText = `Seus pedidos:\n${lines.join('\n')}`;
      return isInteraction ? interactionOrMessage.editReply(replyText) : interactionOrMessage.reply(replyText);
    } catch (error) {
      console.error(error);
      const message = 'Erro ao carregar pedidos.';
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    }
  }
};
