const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createDashboardEmbed(userTag) {
  return new EmbedBuilder()
    .setTitle('NexosPay | Painel de Vendas')
    .setDescription(`Bem-vindo, ${userTag}! Use os botões abaixo para navegar pelo painel.`)
    .setColor('#2f3136')
    .setTimestamp();
}

function createProductEmbed(product) {
  return new EmbedBuilder()
    .setTitle(`╔════════════════════════════╗\n║ PRODUTO: ${product.name} ║`)
    .setDescription(product.description || 'Sem descrição disponível.')
    .addFields(
      { name: 'PREÇO', value: `R$ ${(product.priceCents / 100).toFixed(2)}`, inline: true },
      { name: 'STATUS', value: product.active ? 'Disponível' : 'Indisponível', inline: true },
      { name: 'ENTREGA', value: product.deliveryType, inline: true }
    )
    .setColor('#0b74de');
}

function createButtonRow(buttons) {
  const row = new ActionRowBuilder();
  buttons.forEach((button) => row.addComponents(button));
  return row;
}

function buildActionButton(customId, label, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}

module.exports = { createDashboardEmbed, createProductEmbed, createButtonRow, buildActionButton };
