function errorHandler(err, req, res, next) {
  console.error('Erro capturado:', err);
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  return res.status(status).json({ error: message });
}

module.exports = { errorHandler };
