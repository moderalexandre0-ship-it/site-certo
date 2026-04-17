const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Partials, REST, Routes, InteractionType, ActivityType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { Op } = require('sequelize');
const dotenv = require('dotenv');
const { Product, sequelize } = require('../backend/src/models');
const { ensureDatabaseExists } = require('../backend/src/config/database');

dotenv.config();
const { API_BASE_URL, DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync(path.resolve(__dirname, './commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON ? command.data.toJSON() : command.data);
  } else if (command.name) {
    // Comando de mensagem
    client.commands.set(command.name, command);
  }
}

client.once('clientReady', async () => {
  console.log(`🤖 Discord bot logado como ${client.user.tag}`);
  client.user.setActivity('NexosPay | $menu', { type: ActivityType.Playing });

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: [] });
    console.log('✅ Slash commands removidos. Use apenas $menu.');
    await announcePendingProducts();
  } catch (error) {
    console.error('❌ Erro ao limpar comandos slash ou anunciar produtos:', error.message);
  }
});

async function announcePendingProducts() {
  try {
    const pendingProducts = await Product.findAll({
      where: {
        announced: false,
        announcementChannelId: { [Op.ne]: null }
      }
    });

    for (const product of pendingProducts) {
      try {
        const channel = await client.channels.fetch(product.announcementChannelId);
        if (!channel || !channel.isTextBased()) continue;

        const embed = new EmbedBuilder()
          .setTitle(`Novo Produto: ${product.name}`)
          .setDescription(product.description || 'Sem descrição')
          .setColor(0x3b82f6)
          .addFields(
            { name: 'Preço', value: `R$ ${(product.priceCents / 100).toFixed(2)}`, inline: true },
            { name: 'Estoque', value: `${product.stock}`, inline: true }
          );

        if (product.imageUrl) {
          embed.setImage(product.imageUrl);
        }

        await channel.send({ embeds: [embed] });
        product.announced = true;
        product.announcedAt = new Date();
        await product.save();
      } catch (error) {
        console.error('Erro ao anunciar produto no Discord:', error);
      }
    }
  } catch (error) {
    console.error('Erro ao buscar produtos pendentes:', error);
  }
}

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

client.on('interactionCreate', async (interaction) => {
  // Handle modals
  if (interaction.isModalSubmit()) {
    const { customId } = interaction;

    if (customId === 'mp_connect_modal') {
      try {
        await interaction.deferReply({ flags: 64 }); // Ephemeral reply

        const token = interaction.fields.getTextInputValue('mp_token');

        // Here we need to save the token, but since it's per guild, we need guildId
        // For now, assume it's for the user's guild, but actually, the menu is per user, not guild
        // Perhaps get the guild from the interaction or something
        // For simplicity, let's assume it's saved globally or per user
        // But to match the backend, we need guildId

        // Since the menu is called in a guild context, we can get guildId from interaction.guildId
        const guildId = interaction.guildId;

        const api = require('./services/apiClient').createApiClient(API_BASE_URL, interaction.user.id);

        // Update guild config with MP token
        await api.post('/admin/guild-config', {
          guildId,
          mercadoPagoToken: token
        });

        await interaction.editReply('✅ Token do Mercado Pago configurado com sucesso!');

      } catch (error) {
        console.error('Erro ao configurar Mercado Pago:', error);
        await interaction.editReply('❌ Erro ao configurar Mercado Pago. Verifique o token.');
      }
    }

    if (customId === 'create_product_modal' || customId === 'create_simple_modal' || customId === 'create_advanced_modal' || customId.startsWith('edit_product_modal_')) {
      try {
        await interaction.deferReply({ flags: 64 });

        const api = require('./services/apiClient').createApiClient(API_BASE_URL, interaction.user.id);
        let productData = {};

        if (customId === 'create_product_modal') {
          productData = {
            name: interaction.fields.getTextInputValue('product_name'),
            description: interaction.fields.getTextInputValue('product_description'),
            priceCents: Math.round(parseFloat(interaction.fields.getTextInputValue('product_price')) * 100),
            stock: parseInt(interaction.fields.getTextInputValue('product_stock')) || 9999,
            imageUrl: interaction.fields.getTextInputValue('product_image') || null,
            active: true,
            deliveryType: 'automatica',
            currency: 'BRL'
          };
        } else if (customId === 'create_simple_modal') {
          productData = {
            name: interaction.fields.getTextInputValue('simple_name'),
            description: interaction.fields.getTextInputValue('simple_desc'),
            priceCents: Math.round(parseFloat(interaction.fields.getTextInputValue('simple_price')) * 100),
            stock: 9999,
            active: true,
            deliveryType: 'automatica',
            currency: 'BRL'
          };
        } else if (customId === 'create_advanced_modal') {
          productData = {
            name: interaction.fields.getTextInputValue('adv_name'),
            description: interaction.fields.getTextInputValue('adv_desc'),
            priceCents: Math.round(parseFloat(interaction.fields.getTextInputValue('adv_price')) * 100),
            stock: parseInt(interaction.fields.getTextInputValue('adv_stock')) || 9999,
            imageUrl: interaction.fields.getTextInputValue('adv_image') || null,
            active: true,
            deliveryType: 'automatica',
            currency: 'BRL'
          };
        } else if (customId.startsWith('edit_product_modal_')) {
          const productId = customId.replace('edit_product_modal_', '');
          const updates = {};
          const editName = interaction.fields.getTextInputValue('edit_name');
          const editDescription = interaction.fields.getTextInputValue('edit_description');
          const editPrice = interaction.fields.getTextInputValue('edit_price');
          const editStock = interaction.fields.getTextInputValue('edit_stock');
          const editImage = interaction.fields.getTextInputValue('edit_image');

          if (editName) updates.name = editName;
          if (editDescription) updates.description = editDescription;
          if (editPrice) updates.price = parseFloat(editPrice);
          if (editStock) updates.stock = parseInt(editStock, 10);
          if (editImage) updates.imageUrl = editImage;

          const response = await api.put(`/products/${productId}`, updates);
          const product = response.data;
          await interaction.editReply(`✅ Produto atualizado com sucesso: ${product.name} (ID ${product.id})`);
          return;
        }

        const response = await api.post('/products', productData);
        const product = response.data;
        await interaction.editReply(`✅ Produto "${product.name}" criado com sucesso! ID: ${product.id}`);
      } catch (error) {
        console.error('Erro ao criar/editar produto:', error.message || error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Erro ao processar produto.', flags: 64 }).catch(() => {});
        } else if (interaction.deferred) {
          await interaction.editReply('❌ Erro ao processar produto. Verifique os dados e tente novamente.').catch(() => {});
        }
      }
      return;
    }

    if (customId === 'set_log_channel_modal' || customId === 'add_admin_modal' || customId === 'change_colors_modal') {
      try {
        await interaction.deferReply({ flags: 64 });
        await interaction.editReply('✅ Configuração registrada. A implementação de backend está em andamento.');
      } catch (error) {
        console.error('Erro ao processar modal de configuração:', error.message);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Erro ao processar a configuração.', flags: 64 }).catch(() => {});
        }
      }
      return;
    }
  }

  // Handle buttons
  if (interaction.isButton()) {
    const { customId } = interaction;

    if (customId.startsWith('buy_')) {
      try {
        await interaction.deferReply({ flags: 64 });

        const productId = customId.split('_')[1];
        const api = require('./services/apiClient').createApiClient(API_BASE_URL, interaction.user.id);

        const response = await api.post('/orders', { productId, quantity: 1 });
        const order = response.data;

        await interaction.editReply(`✅ Pedido criado! Use este link para pagar: ${order.payment.paymentUrl}`);
      } catch (error) {
        console.error('Erro ao criar pedido:', error.message);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Erro ao criar pedido.', flags: 64 }).catch(() => {});
        } else if (interaction.deferred) {
          await interaction.editReply('❌ Erro ao criar pedido. Tente novamente.').catch(() => {});
        }
      }
      return;
    }

    if (customId === 'painel_loja') {
      const command = client.commands.get('loja');
      if (command) return command.execute(interaction, { apiBaseUrl: API_BASE_URL, client });
    }

    if (customId === 'painel_pedidos') {
      const command = client.commands.get('ver-pedidos');
      if (command) return command.execute(interaction, { apiBaseUrl: API_BASE_URL, client });
    }

    if (customId.startsWith('menu_')) {
      return; // Já tratado no comando menu
    }

    // Botão não implementado
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Ação ainda não implementada.', flags: 64 }).catch(() => {});
    }
  }

  // Handle slash commands
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, { apiBaseUrl: API_BASE_URL, client });
  } catch (error) {
    console.error('Erro no comando:', error.message);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Erro interno ao processar o comando.', flags: 64 }).catch(() => {});
    }
  }
});

const commandNameMap = {
  menu: 'menu',
  painel: 'painel',
  loja: 'loja',
  comprar: 'comprar',
  pedidos: 'ver-pedidos',
  'ver-pedidos': 'ver-pedidos',
  verpedidos: 'ver-pedidos',
  criarproduto: 'criar-produto',
  'criar-produto': 'criar-produto',
  removerproduto: 'remover-produto',
  'remover-produto': 'remover-produto',
  'set-canal-log': 'set-canal-log',
  setcanallog: 'set-canal-log',
  'set-config': 'set-config',
  setconfig: 'set-config'
};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const prefix = process.env.DISCORD_BOT_PREFIX || '$';
  if (!message.content.startsWith(prefix)) return;

  const [rawCommand, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandKey = commandNameMap[rawCommand.toLowerCase()] || rawCommand.toLowerCase();
  const command = client.commands.get(commandKey);
  if (!command) return;

  try {
    await command.execute(message, {
      apiBaseUrl: process.env.API_BASE_URL,
      client,
      args
    });
  } catch (error) {
    console.error('Erro no comando de texto:', error);
    await message.reply('Erro interno ao processar o comando.');
  }
});

async function startBot() {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('Banco de dados conectado pelo bot.');
    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado pelo bot.');
    await client.login(DISCORD_TOKEN);
  } catch (error) {
    console.error('Erro ao iniciar o bot:', error);
    process.exit(1);
  }
}

startBot();
