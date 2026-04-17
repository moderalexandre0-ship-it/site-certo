function isBotRequest(req) {
  return req.headers['x-bot-api-key'] && req.headers['x-bot-api-key'] === process.env.BOT_API_KEY;
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (isBotRequest(req)) {
    if (req.headers['x-discord-user-id']) {
      req.user = { id: req.headers['x-discord-user-id'] };
    }
    return next();
  }
  return res.status(401).json({ message: 'Usuário não autenticado' });
}

function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  if (isBotRequest(req)) {
    return next();
  }
  return res.status(403).json({ message: 'Acesso restrito ao administrador' });
}

module.exports = { ensureAuthenticated, ensureAdmin, isBotRequest };
