const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { User, UserGuild } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
const isDiscordConfigured = discordClientId && discordClientSecret && discordClientId !== 'your-discord-client-id' && discordClientSecret !== 'your-discord-client-secret' && discordClientId !== discordClientSecret;

if (isDiscordConfigured) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  console.log(`🔐 Discord OAuth Redirect: ${backendUrl}/api/auth/discord/callback`);
  
  passport.use(new DiscordStrategy({
    passReqToCallback: true,
    clientID: discordClientId,
    clientSecret: discordClientSecret,
    callbackURL: `${backendUrl}/api/auth/discord/callback`,
    scope: ['identify', 'email', 'guilds']
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Salvar guilds do Discord na sessão para usar no painel
      if (req && req.session) {
        req.session.discordGuilds = profile.guilds || [];
        req.session.discordAccessToken = accessToken;
      }

      const [user] = await User.findOrCreate({
        where: { discordId: profile.id },
        defaults: {
          discordId: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          email: profile.email || null,
          avatar: profile.avatar || null,
          walletBalance: 0,
          role: 'user'
        }
      });
      if (!user.username || user.username !== profile.username) {
        await user.update({ username: profile.username, discriminator: profile.discriminator, avatar: profile.avatar || user.avatar });
      }

      // Salvar guilds no banco
      if (profile.guilds) {
        await UserGuild.destroy({ where: { userId: user.id } }); // Limpar antigas
        const manageableGuilds = profile.guilds.filter(g =>
          g.owner === true ||
          (BigInt(g.permissions) & 0x8n) === 0x8n
        );
        for (const guild of manageableGuilds) {
          await UserGuild.create({
            userId: user.id,
            guildId: guild.id,
            name: guild.name,
            icon: guild.icon,
            permissions: guild.permissions,
            owner: guild.owner
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.log('Discord OAuth não configurado. Login via Discord desabilitado. Verifique DISCORD_CLIENT_ID e DISCORD_CLIENT_SECRET no .env.');
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET && process.env.DISCORD_CLIENT_ID === process.env.DISCORD_CLIENT_SECRET) {
  console.warn('Atenção: DISCORD_CLIENT_SECRET está igual a DISCORD_CLIENT_ID. Verifique se a secret do aplicativo Discord está correta.');
}
