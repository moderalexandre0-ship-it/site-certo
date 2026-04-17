const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createApiClient } = require('../services/apiClient');
const path = require('path');

module.exports = {
  name: 'menu',
  description: 'Mostra o menu principal do NexosPay',

  async execute(message, { apiBaseUrl, args = [] } = {}) {
    const api = createApiClient(apiBaseUrl, message.author.id);

    try {
      let products = [];
      try {
        const productsResponse = await api.get('/products?includeInactive=true');
        products = productsResponse.data || [];
      } catch (fetchError) {
        console.error('Erro ao buscar produtos do menu:', fetchError.message || fetchError);
      }

      const activeProducts = products.filter(p => p.active);
      const menuEmbed = new EmbedBuilder()
        .setTitle('🏪 NexosPay - Menu Principal')
        .setDescription('Bem-vindo ao painel de controle do NexosPay! Escolha uma opção abaixo:')
        .setColor(0x3b82f6)
        .setImage('attachment://banner.png')
        .addFields(
          { name: '📦 Produtos', value: `${activeProducts.length} produtos ativos`, inline: true },
          { name: '💰 Vendas', value: 'Acompanhe suas vendas e relatórios em tempo real', inline: true },
          { name: '⚙️ Configurações', value: 'Personalize o NexosPay para sua comunidade', inline: true }
        )
        .setFooter({ text: 'NexosPay • Sistema de vendas automatizado' });

      const mainButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('menu_loja')
            .setLabel('🛒 Ver Loja')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('menu_criar_produto')
            .setLabel('➕ Criar Produto')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('menu_pedidos')
            .setLabel('📋 Meus Pedidos')
            .setStyle(ButtonStyle.Secondary)
        );

      const adminButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('menu_mp_connect')
            .setLabel('🔗 Conectar MP')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('menu_logs')
            .setLabel('📊 Logs')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('menu_config')
            .setLabel('⚙️ Configurações')
            .setStyle(ButtonStyle.Secondary)
        );

      const response = await message.reply({
        embeds: [menuEmbed],
        components: [mainButtons, adminButtons],
        files: [{ attachment: path.join(__dirname, '..', 'assets', 'banner.png'), name: 'banner.png' }]
      });

      // Coletar interações dos botões
      const filter = (i) => i.user.id === message.author.id;
      const collector = response.createMessageComponentCollector({ filter, time: 300000 });

      collector.on('collect', async (interaction) => {
        const customId = interaction.customId;

        if (customId === 'menu_loja') {
          await interaction.deferUpdate();
          const lojaCommand = require('./loja');
          await lojaCommand.execute(message, args, { apiBaseUrl });

        } else if (customId === 'menu_criar_produto') {
          await interaction.deferUpdate();
          const criarProdutoCommand = require('./criarProduto');
          await criarProdutoCommand.execute(interaction, args, { apiBaseUrl });

        } else if (customId === 'menu_pedidos') {
          await interaction.deferUpdate();
          const verPedidosCommand = require('./verPedidos');
          await verPedidosCommand.execute(message, args, { apiBaseUrl });

        } else if (customId === 'menu_mp_connect') {
          // Mostrar modal para conectar Mercado Pago
          const mpEmbed = new EmbedBuilder()
            .setTitle('🔗 Conectar Mercado Pago')
            .setDescription('Para conectar sua conta Mercado Pago, você precisa do Access Token.\n\n**Como obter:**\n1. Acesse [Mercado Pago Developers](https://developers.mercadolibre.com.br/)\n2. Crie uma aplicação\n3. Copie o Access Token de produção')
            .setColor(0x00b4d8)
            .addFields(
              { name: '🔑 Access Token', value: 'Cole seu token abaixo:', inline: false }
            );

          const mpModal = new ModalBuilder()
            .setCustomId('mp_connect_modal')
            .setTitle('Conectar Mercado Pago');

          const tokenInput = new TextInputBuilder()
            .setCustomId('mp_token')
            .setLabel('Access Token do Mercado Pago')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('APP_USR-...');

          mpModal.addComponents(new ActionRowBuilder().addComponents(tokenInput));

          await interaction.showModal(mpModal);

        } else if (customId === 'menu_logs') {
          await interaction.deferUpdate();
          // Mostrar logs do sistema
          const logsEmbed = new EmbedBuilder()
            .setTitle('📊 Logs do Sistema')
            .setDescription('Aqui você pode ver todas as atividades do sistema:')
            .setColor(0x6b7280)
            .addFields(
              { name: '📈 Vendas', value: 'Visualizar vendas realizadas', inline: true },
              { name: '🔄 Transações', value: 'Ver transações PIX', inline: true },
              { name: '📦 Estoque', value: 'Controle de estoque', inline: true }
            );

          const logsButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('logs_sales')
                .setLabel('💰 Vendas')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('logs_transactions')
                .setLabel('🔄 Transações')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('logs_stock')
                .setLabel('📦 Estoque')
                .setStyle(ButtonStyle.Success)
            );

          await interaction.editReply({
            embeds: [logsEmbed],
            components: [logsButtons]
          });

        } else if (customId === 'menu_config') {
          await interaction.deferUpdate();
          // Mostrar configurações
          const configEmbed = new EmbedBuilder()
            .setTitle('⚙️ Configurações do Sistema')
            .setDescription('Configure diversos aspectos do seu sistema NexosPay:')
            .setColor(0x8b5cf6)
            .addFields(
              { name: '📢 Canais', value: 'Configurar canais de anúncio e logs', inline: true },
              { name: '🔐 Permissões', value: 'Gerenciar permissões de admin', inline: true },
              { name: '🎨 Aparência', value: 'Personalizar embeds e mensagens', inline: true }
            );

          const configButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('config_channels')
                .setLabel('📢 Canais')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('config_perms')
                .setLabel('🔐 Permissões')
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId('config_theme')
                .setLabel('🎨 Tema')
                .setStyle(ButtonStyle.Success)
            );

          await interaction.editReply({
            embeds: [configEmbed],
            components: [configButtons]
          });
        } else if (customId === 'logs_sales') {
          await interaction.deferUpdate();
          const ordersResponse = await api.get('/orders');
          const orders = ordersResponse.data || [];
          const salesEmbed = new EmbedBuilder()
            .setTitle('💰 Vendas Realizadas')
            .setDescription(`Total de vendas: ${orders.length}`)
            .setColor(0x10b981)
            .addFields(
              ...orders.slice(0, 10).map(order => ({
                name: `Pedido #${order.id}`,
                value: `Produto: ${order.Product?.name || 'N/A'}\nValor: R$ ${(order.totalCents / 100).toFixed(2)}\nStatus: ${order.status}`,
                inline: false
              }))
            );
          const backButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('menu_back')
                .setLabel('⬅️ Voltar')
                .setStyle(ButtonStyle.Secondary)
            );
          await interaction.editReply({
            embeds: [salesEmbed],
            components: [backButton]
          });
        } else if (customId === 'logs_transactions') {
          await interaction.deferUpdate();
          const paymentsResponse = await api.get('/payments');
          const payments = paymentsResponse.data || [];
          const transactionsEmbed = new EmbedBuilder()
            .setTitle('🔄 Transações PIX')
            .setDescription(`Total de transações: ${payments.length}`)
            .setColor(0x3b82f6)
            .addFields(
              ...payments.slice(0, 10).map(payment => ({
                name: `Pagamento #${payment.id}`,
                value: `Valor: R$ ${(payment.amountCents / 100).toFixed(2)}\nStatus: ${payment.status}\nMétodo: ${payment.method}`,
                inline: false
              }))
            );
          const backButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('menu_back')
                .setLabel('⬅️ Voltar')
                .setStyle(ButtonStyle.Secondary)
            );
          await interaction.editReply({
            embeds: [transactionsEmbed],
            components: [backButton]
          });
        } else if (customId === 'logs_stock') {
          await interaction.deferUpdate();
          const productsResponse = await api.get('/products?includeInactive=true');
          const products = productsResponse.data || [];
          const stockEmbed = new EmbedBuilder()
            .setTitle('📦 Controle de Estoque')
            .setDescription(`Produtos ativos: ${products.filter(p => p.active).length}`)
            .setColor(0xf59e0b)
            .addFields(
              ...products.slice(0, 10).map(product => ({
                name: product.name,
                value: `Estoque: ${product.stock || 'Ilimitado'}\nPreço: R$ ${(product.priceCents / 100).toFixed(2)}\nAtivo: ${product.active ? 'Sim' : 'Não'}`,
                inline: true
              }))
            );
          const backButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('menu_back')
                .setLabel('⬅️ Voltar')
                .setStyle(ButtonStyle.Secondary)
            );
          await interaction.editReply({
            embeds: [stockEmbed],
            components: [backButton]
          });
        } else if (customId === 'config_channels') {
          await interaction.deferUpdate();
          const channelsEmbed = new EmbedBuilder()
            .setTitle('📢 Configuração de Canais')
            .setDescription('Configure os canais de anúncio e logs:')
            .setColor(0x8b5cf6)
            .addFields(
              { name: '📢 Canal de Anúncios', value: 'Canal para anúncios de produtos', inline: true },
              { name: '📊 Canal de Logs', value: 'Canal para logs do sistema', inline: true }
            );
          const channelsButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('set_log_channel')
                .setLabel('📊 Definir Log')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('menu_back')
                .setLabel('⬅️ Voltar')
                .setStyle(ButtonStyle.Secondary)
            );
          await interaction.editReply({
            embeds: [channelsEmbed],
            components: [channelsButtons]
          });
        } else if (customId === 'config_perms') {
          await interaction.deferUpdate();
          const permsEmbed = new EmbedBuilder()
            .setTitle('🔐 Gerenciamento de Permissões')
            .setDescription('Configure permissões de admin:')
            .setColor(0x8b5cf6)
            .addFields(
              { name: '👑 Admins', value: 'Usuários com acesso admin', inline: true }
            );
          const permsButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('add_admin')
                .setLabel('➕ Adicionar Admin')
                .setStyle(ButtonStyle.Success),
              new ButtonBuilder()
                .setCustomId('menu_back')
                .setLabel('⬅️ Voltar')
                .setStyle(ButtonStyle.Secondary)
            );
          await interaction.editReply({
            embeds: [permsEmbed],
            components: [permsButtons]
          });
        } else if (customId === 'config_theme') {
          await interaction.deferUpdate();
          const themeEmbed = new EmbedBuilder()
            .setTitle('🎨 Personalização de Tema')
            .setDescription('Personalize cores e aparência:')
            .setColor(0x8b5cf6)
            .addFields(
              { name: '🎨 Cores', value: 'Alterar cores dos embeds', inline: true },
              { name: '📝 Mensagens', value: 'Personalizar textos', inline: true }
            );
          const themeButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('change_colors')
                .setLabel('🎨 Alterar Cores')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('menu_back')
                .setLabel('⬅️ Voltar')
                .setStyle(ButtonStyle.Secondary)
            );
          await interaction.editReply({
            embeds: [themeEmbed],
            components: [themeButtons]
          });
        } else if (customId === 'set_log_channel') {
          const logModal = new ModalBuilder()
            .setCustomId('set_log_channel_modal')
            .setTitle('Definir Canal de Logs');

          const channelInput = new TextInputBuilder()
            .setCustomId('log_channel_id')
            .setLabel('ID do Canal de Logs')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('123456789012345678');

          logModal.addComponents(new ActionRowBuilder().addComponents(channelInput));

          await interaction.showModal(logModal);
        } else if (customId === 'add_admin') {
          const adminModal = new ModalBuilder()
            .setCustomId('add_admin_modal')
            .setTitle('Adicionar Admin');

          const userInput = new TextInputBuilder()
            .setCustomId('admin_user_id')
            .setLabel('ID do Usuário')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('123456789012345678');

          adminModal.addComponents(new ActionRowBuilder().addComponents(userInput));

          await interaction.showModal(adminModal);
        } else if (customId === 'change_colors') {
          const colorModal = new ModalBuilder()
            .setCustomId('change_colors_modal')
            .setTitle('Alterar Cores');

          const primaryInput = new TextInputBuilder()
            .setCustomId('primary_color')
            .setLabel('Cor Primária (Hex)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('#3b82f6');

          colorModal.addComponents(new ActionRowBuilder().addComponents(primaryInput));

          await interaction.showModal(colorModal);
        } else if (customId === 'menu_back') {
          await interaction.deferUpdate();
          await interaction.editReply({ embeds: [menuEmbed], components: [mainButtons, adminButtons] });
        }
      });

      collector.on('end', () => {
        // Timeout - editar mensagem para remover botões
        response.edit({
          content: '⏰ Menu expirado. Use `$menu` novamente.',
          embeds: [],
          components: []
        }).catch(() => {});
      });

    } catch (error) {
      console.error('Erro no menu:', error);
      await message.reply('Erro ao carregar o menu. Tente novamente.');
    }
  }
};