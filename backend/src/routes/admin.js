const express = require('express');
const axios = require('axios');
const { GuildConfig, Log, UserGuild } = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authenticate');
const router = express.Router();

const discordApi = axios.create({
  baseURL: 'https://discord.com/api/v10',
  headers: {
    Authorization: `Bot ${process.env.DISCORD_TOKEN}`
  }
});

router.get('/discord/guilds', ensureAuthenticated, async (req, res, next) => {
  try {
    const userGuilds = await UserGuild.findAll({ where: { userId: req.user.id } });
    const guilds = [];

    for (const guild of userGuilds) {
      let botInstalled = false;
      try {
        await discordApi.get(`/guilds/${guild.guildId}`);
        botInstalled = true;
      } catch (error) {
        // bot não está na guilda
      }
      guilds.push({ id: guild.guildId, name: guild.name, icon: guild.icon, permissions: guild.permissions, owner: guild.owner, botInstalled });
    }

    return res.json(guilds);
  } catch (error) {
    next(error);
  }
});

router.get('/discord/guilds/:guildId/channels', ensureAuthenticated, async (req, res, next) => {
  try {
    const userGuild = await UserGuild.findOne({ where: { userId: req.user.id, guildId: req.params.guildId } });
    if (!userGuild) {
      return res.status(403).json({ message: 'Acesso negado a esta guilda.' });
    }

    // Verificar se o bot está na guilda
    try {
      await discordApi.get(`/guilds/${req.params.guildId}`);
    } catch (error) {
      return res.status(403).json({ message: 'Bot não está nesta guilda.' });
    }

    const response = await discordApi.get(`/guilds/${req.params.guildId}/channels`);
    const channels = response.data
      .filter(channel => [0, 4, 5].includes(channel.type))
      .map(channel => ({
        id: channel.id,
        name: channel.name || `Canal ${channel.id}`,
        type: channel.type,
        parentId: channel.parent_id
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json(channels);
  } catch (error) {
    if (error.response?.status === 403) {
      return res.status(403).json({ message: 'Bot não está nesta guilda ou não tem permissão.' });
    }
    next(error);
  }
});

router.get('/guild-config/:guildId', ensureAuthenticated, ensureAdmin, async (req, res, next) => {
  try {
    const config = await GuildConfig.findOne({ where: { guildId: req.params.guildId } });
    res.json(config || {});
  } catch (error) {
    next(error);
  }
});

router.post('/guild-config', ensureAuthenticated, ensureAdmin, async (req, res, next) => {
  try {
    const { guildId, adminRoleId, logChannelId, paymentChannelId, defaultCurrency, botName, botLogo, botCover, mercadoPagoToken } = req.body;
    const [config] = await GuildConfig.upsert({ guildId, adminRoleId, logChannelId, paymentChannelId, defaultCurrency, botName, botLogo, botCover, mercadoPagoToken });
    res.json(config);
  } catch (error) {
    next(error);
  }
});

router.get('/logs/:guildId', ensureAuthenticated, ensureAdmin, async (req, res, next) => {
  try {
    const logs = await Log.findAll({ where: { guildId: req.params.guildId }, order: [['createdAt', 'DESC']] });
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
