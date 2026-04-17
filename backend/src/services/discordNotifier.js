const axios = require('axios');
const { Log, GuildConfig } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

async function sendLogToDiscord(guildId, content) {
  try {
    const config = await GuildConfig.findOne({ where: { guildId } });
    if (!config || !config.logChannelId) return;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    await axios.post(webhookUrl, { content });
  } catch (err) {
    console.warn('Falha ao enviar log para Discord:', err.message);
  }
}

async function logAction({ guildId, userId, action, details, level = 'info' }) {
  try {
    await Log.create({ guildId, userId, action, details, level });
    if (guildId) {
      await sendLogToDiscord(guildId, `[32m[${level.toUpperCase()}][0m ${action} - ${details}`);
    }
  } catch (err) {
    console.error('Log action failed:', err.message);
  }
}

module.exports = { logAction };
