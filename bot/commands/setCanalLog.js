const { SlashCommandBuilder } = require('discord.js');
const { createApiClient } = require('../services/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-canal-log')
    .setDescription('Define o canal de logs do servidor NexosPay.')
    .addChannelOption(option => option.setName('canal').setDescription('Canal de logs').setRequired(true)),

  async execute(interactionOrMessage, { apiBaseUrl, args = [] } = {}) {
    const isInteraction = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    const api = createApiClient(apiBaseUrl);
    let channel;
    if (isInteraction) {
      await interactionOrMessage.deferReply({ flags: 64 });
      channel = interactionOrMessage.options.getChannel('canal');
    } else {
      const channelId = args[0]?.replace(/[^0-9]/g, '');
      channel = interactionOrMessage.guild?.channels.cache.get(channelId);
      if (!channel) return interactionOrMessage.reply('Uso: $setcanallog #canal');
    }

    try {
      await api.post('/admin/guild-config', {
        guildId: interactionOrMessage.guildId,
        logChannelId: channel.id,
        defaultCurrency: 'BRL'
      });
      const message = `Canal de logs definido para <#${channel.id}>`;
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    } catch (error) {
      console.error(error);
      const message = 'Não foi possível configurar o canal de logs.';
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    }
  }
};
