const axios = require('axios');

function createApiClient(baseURL, userId) {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.BOT_API_KEY) {
    headers['x-bot-api-key'] = process.env.BOT_API_KEY;
  }
  if (userId) {
    headers['x-discord-user-id'] = userId;
  }
  return axios.create({
    baseURL: baseURL || process.env.API_BASE_URL || 'http://localhost:3000/api',
    headers,
    timeout: 15000
  });
}

module.exports = { createApiClient };
