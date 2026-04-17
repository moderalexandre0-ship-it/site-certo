const { SlashCommandBuilder } = require('discord.js');
const { createApiClient } = require('../services/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remover-produto')
    .setDescription('Remove um produto do catálogo NexosPay (admin).')
    .addIntegerOption(option => option.setName('produto_id').setDescription('ID do produto').setRequired(true)),

  async execute(interactionOrMessage, { apiBaseUrl, args = [] } = {}) {
    const isInteraction = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    const id = isInteraction ? interactionOrMessage.options.getInteger('produto_id') : Number(args[0]);
    if (!id || Number.isNaN(id)) {
      const message = 'Uso: $removerproduto <produto_id>';
      return isInteraction ? interactionOrMessage.reply({ content: message, flags: 64 }) : interactionOrMessage.reply(message);
    }
    if (isInteraction) await interactionOrMessage.deferReply({ flags: 64 });
    const api = createApiClient(apiBaseUrl, interactionOrMessage.user?.id || null);
    try {
      await api.delete(`/products/${id}`);
      const message = `Produto ${id} removido com sucesso.`;
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    } catch (error) {
      console.error(error);
      const message = 'Falha ao remover produto. Verifique as permissões e tente novamente.';
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    }
  }
};
