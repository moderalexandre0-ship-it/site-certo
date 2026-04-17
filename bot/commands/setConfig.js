const { SlashCommandBuilder } = require('discord.js');
const { createApiClient } = require('../services/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-config')
    .setDescription('Define configuração básica do NexosPay para o servidor.')
    .addRoleOption(option => option.setName('admin_role').setDescription('Cargo de administrador NexosPay').setRequired(false))
    .addChannelOption(option => option.setName('payment_channel').setDescription('Canal de pagamentos').setRequired(false))
    .addStringOption(option => option.setName('currency').setDescription('Moeda padrão').setRequired(false)),

  async execute(interactionOrMessage, { apiBaseUrl, args = [] } = {}) {
    const isInteraction = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    const api = createApiClient(apiBaseUrl);
    let adminRoleId = null;
    let paymentChannelId = null;
    let defaultCurrency = 'BRL';

    if (isInteraction) {
      await interactionOrMessage.deferReply({ flags: 64 });
      adminRoleId = interactionOrMessage.options.getRole('admin_role')?.id || null;
      paymentChannelId = interactionOrMessage.options.getChannel('payment_channel')?.id || null;
      defaultCurrency = interactionOrMessage.options.getString('currency') || 'BRL';
    } else {
      if (args[0]) adminRoleId = args[0].replace(/[^0-9]/g, '');
      if (args[1]) paymentChannelId = args[1].replace(/[^0-9]/g, '');
      if (args[2]) defaultCurrency = args[2].toUpperCase();
    }

    try {
      await api.post('/admin/guild-config', {
        guildId: interactionOrMessage.guildId,
        adminRoleId,
        paymentChannelId,
        defaultCurrency
      });
      const message = 'Configuração NexosPay atualizada com sucesso.';
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    } catch (error) {
      console.error(error);
      const message = 'Erro ao atualizar configuração.';
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    }
  }
};
