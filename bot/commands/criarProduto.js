const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createApiClient } = require('../services/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criar-produto')
    .setDescription('Cria um novo produto NexosPay (admin).')
    .addStringOption(option => option.setName('nome').setDescription('Nome do produto').setRequired(true))
    .addStringOption(option => option.setName('descricao').setDescription('Descrição do produto').setRequired(true))
    .addIntegerOption(option => option.setName('preco').setDescription('Preço em centavos').setRequired(true))
    .addIntegerOption(option => option.setName('estoque').setDescription('Estoque disponível').setRequired(false))
    .addStringOption(option => option.setName('entrega').setDescription('Tipo de entrega').setRequired(false))
    .addStringOption(option => option.setName('imagem').setDescription('URL da imagem do produto').setRequired(false)),

  async execute(interactionOrMessage, { apiBaseUrl, args = [] } = {}) {
    const isSlash = interactionOrMessage.isCommand && typeof interactionOrMessage.isCommand === 'function' && interactionOrMessage.isCommand();
    const isButton = interactionOrMessage.isButton && typeof interactionOrMessage.isButton === 'function' && interactionOrMessage.isButton();
    const isInteraction = isSlash || isButton;
    const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
    const channel = isInteraction ? interactionOrMessage.channel : interactionOrMessage.channel;
    const api = createApiClient(apiBaseUrl, user.id);

    async function renderCreateMenu(targetChannel) {
      const menuEmbed = new EmbedBuilder()
        .setTitle('🛠️ Criar Produto - NexosPay')
        .setDescription('Escolha uma opção para criar seu produto:')
        .setColor(0x3b82f6)
        .addFields(
          { name: '📝 Criar Simples', value: 'Criação rápida com informações básicas', inline: false },
          { name: '🎨 Criar Avançado', value: 'Criação completa com todas as opções', inline: false },
          { name: '📊 Gerenciar Produtos', value: 'Editar, ativar/desativar produtos existentes', inline: false }
        );

      const menuButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_simple')
            .setLabel('📝 Criar Simples')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('create_advanced')
            .setLabel('🎨 Criar Avançado')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('manage_products')
            .setLabel('📊 Gerenciar')
            .setStyle(ButtonStyle.Secondary)
        );

      const response = await targetChannel.send({ embeds: [menuEmbed], components: [menuButtons] });
      const filter = (i) => i.user.id === user.id;
      const collector = response.createMessageComponentCollector({ filter, time: 300000 });

      const renderProductActions = async (product, interaction) => {
        const statusLabel = product.active ? 'Desativar' : 'Ativar';
        const manageEmbed = new EmbedBuilder()
          .setTitle(`🛠️ Produto: ${product.name}`)
          .setDescription(product.description || 'Sem descrição')
          .setColor(product.active ? 0x22c55e : 0xef4444)
          .addFields(
            { name: '💰 Preço', value: `R$ ${(product.priceCents / 100).toFixed(2)}`, inline: true },
            { name: '📦 Estoque', value: `${product.stock}`, inline: true },
            { name: '🟢 Ativo', value: product.active ? 'Sim' : 'Não', inline: true }
          );

        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`edit_product_${product.id}`)
            .setLabel('✏️ Editar')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`toggle_active_${product.id}`)
            .setLabel(statusLabel)
            .setStyle(product.active ? ButtonStyle.Danger : ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`delete_product_${product.id}`)
            .setLabel('🗑️ Excluir')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('back_create_menu')
            .setLabel('⬅️ Voltar')
            .setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({ embeds: [manageEmbed], components: [actionRow] });
      };

      collector.on('collect', async (interaction) => {
        try {
          const customId = interaction.customId;

          if (customId === 'create_simple' || customId === 'create_advanced') {
            const modal = new ModalBuilder()
              .setCustomId(customId === 'create_simple' ? 'create_simple_modal' : 'create_advanced_modal')
              .setTitle(customId === 'create_simple' ? 'Criar Produto Simples' : 'Criar Produto Avançado');

            const rows = [];
            if (customId === 'create_simple') {
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('simple_name')
                  .setLabel('Nome do Produto')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
              ));
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('simple_price')
                  .setLabel('Preço (R$)')
                  .setStyle(TextInputStyle.Short)
                  .setPlaceholder('10.50')
                  .setRequired(true)
              ));
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('simple_desc')
                  .setLabel('Descrição')
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
              ));
            } else {
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('adv_name')
                  .setLabel('Nome do Produto')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
              ));
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('adv_desc')
                  .setLabel('Descrição')
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
              ));
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('adv_price')
                  .setLabel('Preço (R$)')
                  .setStyle(TextInputStyle.Short)
                  .setPlaceholder('10.50')
                  .setRequired(true)
              ));
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('adv_stock')
                  .setLabel('Estoque')
                  .setStyle(TextInputStyle.Short)
                  .setPlaceholder('9999')
                  .setRequired(false)
              ));
              rows.push(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('adv_image')
                  .setLabel('URL da Imagem')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              ));
            }

            modal.addComponents(...rows);
            await interaction.showModal(modal);
          } else if (customId === 'manage_products') {
            await interaction.deferUpdate();
            try {
              const productsResponse = await api.get('/products?includeInactive=true');
              const products = productsResponse.data || [];

              if (!products.length) {
                await interaction.editReply({ content: 'Nenhum produto encontrado.', embeds: [], components: [] });
                return;
              }

              const manageEmbed = new EmbedBuilder()
                .setTitle('📊 Gerenciar Produtos')
                .setDescription('Selecione um produto para editar:')
                .setColor(0x3b82f6)
                .setFooter({ text: 'Mostrando até 4 produtos por vez.' });

              const productButtons = products.slice(0, 4).map(product =>
                new ButtonBuilder()
                  .setCustomId(`manage_${product.id}`)
                  .setLabel(`${product.name.substring(0, 20)}${product.name.length > 20 ? '...' : ''}`)
                  .setStyle(ButtonStyle.Secondary)
              );

              const manageRow = new ActionRowBuilder().addComponents(productButtons);
              await interaction.editReply({ embeds: [manageEmbed], components: [manageRow] });
            } catch (error) {
              console.error('Erro ao carregar produtos:', error);
              await interaction.editReply({ content: '❌ Erro ao carregar produtos.', embeds: [], components: [] });
            }
          } else if (customId.startsWith('manage_')) {
            await interaction.deferUpdate();
            const productId = customId.split('_')[1];
            try {
              const productResponse = await api.get(`/products/${productId}`);
              await renderProductActions(productResponse.data, interaction);
            } catch (error) {
              console.error('Erro ao carregar produto:', error);
              await interaction.editReply({ content: '❌ Erro ao carregar o produto.', embeds: [], components: [] });
            }
          } else if (customId.startsWith('edit_product_')) {
            const productId = customId.split('_')[2];
            const editModal = new ModalBuilder()
              .setCustomId(`edit_product_modal_${productId}`)
              .setTitle('Editar Produto');

            editModal.addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('edit_name')
                  .setLabel('Nome')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('edit_description')
                  .setLabel('Descrição')
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(false)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('edit_price')
                  .setLabel('Preço (R$)')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('edit_stock')
                  .setLabel('Estoque')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('edit_image')
                  .setLabel('URL da Imagem')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false)
              )
            );

            await interaction.showModal(editModal);
          } else if (customId.startsWith('toggle_active_')) {
            await interaction.deferUpdate();
            const productId = customId.split('_')[2];
            try {
              const productResponse = await api.get(`/products/${productId}`);
              const product = productResponse.data;
              const updatedResponse = await api.put(`/products/${productId}`, { active: !product.active });
              const updated = updatedResponse.data;
              await interaction.editReply({ content: `✅ Produto ${updated.name} agora está ${updated.active ? 'ativo' : 'inativo'}.`, embeds: [], components: [] });
            } catch (error) {
              console.error('Erro ao atualizar status do produto:', error);
              await interaction.editReply({ content: '❌ Não foi possível atualizar o produto.', embeds: [], components: [] });
            }
          } else if (customId.startsWith('delete_product_')) {
            await interaction.deferUpdate();
            const productId = customId.split('_')[2];
            try {
              await api.delete(`/products/${productId}`);
              await interaction.editReply({ content: '✅ Produto excluído com sucesso.', embeds: [], components: [] });
            } catch (error) {
              console.error('Erro ao excluir produto:', error);
              await interaction.editReply({ content: '❌ Não foi possível excluir o produto.', embeds: [], components: [] });
            }
          } else if (customId === 'back_create_menu') {
            await interaction.deferUpdate();
            await interaction.editReply({ embeds: [menuEmbed], components: [menuButtons] });
          }
        } catch (error) {
          console.error('Erro ao processar botão do menu:', error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Erro ao processar ação. Tente novamente.', flags: 64 });
          } else if (interaction.deferred && !interaction.replied) {
            await interaction.editReply({ content: '❌ Erro ao processar ação. Tente novamente.' });
          }
        }
      });

      collector.on('end', () => {
        response.edit({ content: '⏰ Menu expirado. Use `$menu` novamente.', embeds: [], components: [] }).catch(() => {});
      });
    }

    if (isSlash) {
      try {
        const productData = {
          name: interactionOrMessage.options.getString('nome'),
          description: interactionOrMessage.options.getString('descricao'),
          priceCents: interactionOrMessage.options.getInteger('preco'),
          stock: interactionOrMessage.options.getInteger('estoque') || 9999,
          deliveryType: interactionOrMessage.options.getString('entrega') || 'automatica',
          imageUrl: interactionOrMessage.options.getString('imagem') || null,
          active: true,
          currency: 'BRL'
        };

        const response = await api.post('/products', productData);
        const product = response.data;
        await interactionOrMessage.editReply(`✅ Produto criado com sucesso: ${product.name} (ID ${product.id})`);
      } catch (error) {
        console.error('Erro ao criar produto via slash:', error);
        await interactionOrMessage.editReply('❌ Erro ao criar o produto. Verifique os dados e tente novamente.');
      }
      return;
    }

    if (isButton && interactionOrMessage.customId === 'menu_criar_produto') {
      await interactionOrMessage.deferUpdate();
      await renderCreateMenu(channel);
      return;
    }

    try {
      await renderCreateMenu(channel);
    } catch (error) {
      console.error('Erro ao exibir menu de criação:', error);
      await channel.send('❌ Erro ao exibir menu de criação. Tente novamente.');
    }
  }
};
