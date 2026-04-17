const express = require('express');
const passport = require('passport');
const { User, UserGuild } = require('../models');
const router = express.Router();

const isDiscordConfigured = process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET &&
  process.env.DISCORD_CLIENT_ID !== 'your-discord-client-id' &&
  process.env.DISCORD_CLIENT_SECRET !== 'your-discord-client-secret' &&
  process.env.DISCORD_CLIENT_ID !== process.env.DISCORD_CLIENT_SECRET;

if (isDiscordConfigured) {
  router.get('/login', (req, res) => res.redirect('/api/auth/discord/login'));
  router.get('/callback', (req, res) => res.redirect('/api/auth/discord/callback'));

  router.get('/discord/login', passport.authenticate('discord', {
    scope: ['identify', 'email', 'guilds'],
    session: false,
    failureRedirect: '/?error=auth_failed'
  }));

  router.get('/discord/callback', (req, res, next) => {
    passport.authenticate('discord', { failureRedirect: '/?error=auth_failed', session: false }, (err, user) => {
      if (err || !user) {
        return res.redirect('/?error=auth_failed');
      }
      req.logIn(user, { session: true }, (loginErr) => {
        if (loginErr) {
          console.error('Erro ao criar sessão de login:', loginErr);
          return res.redirect('/?error=auth_failed');
        }
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  });
} else {
  router.get('/login', (req, res) => res.status(503).json({ error: 'Discord OAuth não configurado' }));
  router.get('/callback', (req, res) => res.status(503).json({ error: 'Discord OAuth não configurado' }));
  router.get('/discord/login', (req, res) => res.status(503).json({ error: 'Discord OAuth não configurado' }));
  router.get('/discord/callback', (req, res) => res.status(503).json({ error: 'Discord OAuth não configurado' }));
}

router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false });
  }
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  const guilds = await UserGuild.findAll({ where: { userId: req.user.id } });
  
  // Formatar discriminador corretamente (remover # se estiver vazio ou 0)
  const displayDiscriminator = user.discriminator && user.discriminator !== '0' 
    ? `#${user.discriminator}` 
    : '';
  res.json({
    authenticated: true,
    user: {
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      discriminator: displayDiscriminator,
      email: user.email,
      avatar: user.avatar,
      walletBalance: user.walletBalance,
      role: user.role
    },
    guilds: guilds.map(g => ({ id: g.guildId, name: g.name, icon: g.icon, permissions: g.permissions, owner: g.owner, botInstalled: true }))
  });
});

router.post('/logout', (req, res) => {
  if (typeof req.logout === 'function') {
    req.logout(() => {});
  }
  if (req.session) {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  } else {
    res.json({ success: true });
  }
});

module.exports = router;
