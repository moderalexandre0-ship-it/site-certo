const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createDashboardEmbed } = require('../services/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('painel').setDescription('Abre o painel NexosPay com opções de administração e compras.'),
  async execute(interactionOrMessage, options = {}) {
    if (!interactionOrMessage) return;
    const isInteraction = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
    if (!user || !user.username) return;
    const embed = createDashboardEmbed(user.username);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('painel_loja').setLabel('Loja').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('painel_pedidos').setLabel('Meus pedidos').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('painel_suporte').setLabel('Suporte').setStyle(ButtonStyle.Secondary)
    );

    if (isInteraction) {
      await interactionOrMessage.reply({ embeds: [embed], components: [row], flags: 64 });
    } else {
      await interactionOrMessage.reply({ embeds: [embed], components: [row] });
    }
  }
};
