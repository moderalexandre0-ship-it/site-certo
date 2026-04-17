const { SlashCommandBuilder } = require('discord.js');
const { createProductEmbed } = require('../services/embeds');
const { createApiClient } = require('../services/apiClient');

module.exports = {
  data: new SlashCommandBuilder().setName('loja').setDescription('Exibe os produtos disponíveis na loja NexosPay.'),
  async execute(interactionOrMessage, { apiBaseUrl, args = [] } = {}) {
    const isInteraction = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    if (isInteraction) await interactionOrMessage.deferReply({ flags: 64 });
    // Simular produtos para teste
    const products = [
      { name: 'Produto 1', description: 'Descrição 1', priceCents: 1000 },
      { name: 'Produto 2', description: 'Descrição 2', priceCents: 2000 }
    ];
    if (!Array.isArray(products) || products.length === 0) {
      const message = 'Nenhum produto disponível no momento.';
      return isInteraction ? interactionOrMessage.editReply(message) : interactionOrMessage.reply(message);
    }
    const { EmbedBuilder } = require('discord.js');
    const embeds = products.slice(0, 5).map(product => new EmbedBuilder()
      .setTitle(product.name)
      .setDescription(product.description)
      .addFields({ name: 'Preço', value: `R$ ${(product.priceCents / 100).toFixed(2)}` })
      .setColor(0x3b82f6)
    );
    return isInteraction ? interactionOrMessage.editReply({ embeds }) : interactionOrMessage.reply({ embeds });
  }
};
