# Configuração do NexosPay no Railway

## Pré-requisitos

- Repositório Git enviado para GitHub/GitLab
- Projeto no Railway criado
- Serviço MySQL criado no Railway

## Passo 1: Conectar repositório ao Railway

1. No Railway, clique em "New Project"
2. Selecione "Deploy from GitHub"
3. Autorize e selecione seu repositório `site-certo`
4. Railway detectará automaticamente que é Node.js

## Passo 2: Configurar o serviço MySQL

Se ainda não tiver:
1. No seu projeto Railway, clique em "+ New" → "Database" → "MySQL"
2. Railway criará um banco `railway` automaticamente
3. Copie as credenciais fornecidas

## Passo 3: Configurar variáveis de ambiente no Railway

No Railway, vá em seu serviço Node (backend):
- Clique em "Variables"
- Adicione as variáveis abaixo:

### Variáveis obrigatórias (copiadas do MySQL do Railway)

```
MYSQL_URL=mysql://root:YOUR_PASSWORD@mysql.railway.internal:3306/railway
MYSQL_DATABASE=railway
MYSQL_HOST=mysql.railway.internal
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_PASSWORD
```

### Variáveis Discord

```
DISCORD_TOKEN=SEU_TOKEN_AQUI
DISCORD_CLIENT_ID=1493935131256295576
DISCORD_CLIENT_SECRET=9Ouy_oU6CPyvmEpr2Kv0EJGboGxFa2d9
DISCORD_BOT_PREFIX=$
```

### Outras variáveis

```
BOT_API_KEY=070731
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-7497236776728929-040609-b1914ef598e94eb89d16f922d1cd611d-3206755829
FRONTEND_URL=http://seu-dominio.railway.app
BACKEND_PORT=3000
API_BASE_URL=http://seu-dominio.railway.app/api
SESSION_SECRET=gere-uma-chave-aleatoria-aqui
```

## Passo 4: Configurar start command (se necessário)

No Railway, em "Deployment":
- Command: `npm start`
- Se Railroad não auto-detectar, adicione manualmente

## Passo 5: Deploy

1. Faça push do código para GitHub:
```bash
git add .
git commit -m "Railway setup"
git push origin main
```

2. Railway detectará a mudança e fará deploy automaticamente
3. Verifique os logs: "Deployments" → seu deploy → "Logs"

## Esperado após deploy

- Backend inicia em `port 3000`
- Banco `railway` já existe
- Tabelas são criadas automaticamente via `sequelize.sync()`
- ✅ `MySQL conectado com sucesso`
- ✅ `Tabelas sincronizadas`
- ✅ `NexosPay backend rodando em http://seu-servico.railway.app`

## Troubleshooting

### Erro: "Missing database configuration"

- Verifique se `MYSQL_URL` ou `MYSQL_HOST`/`MYSQL_PASSWORD` estão definidos no Railway
- Vá em Variables e confirme que estão preenchidos

### Erro: "ECONNREFUSED"

- Verifique se o serviço MySQL está rodando no Railway
- O host deve ser `mysql.railway.internal` (não localhost)

### Tabelas não aparecem

- Aguarde alguns segundos após o deploy
- Cheque os logs: deve haver "Tabelas sincronizadas"
- Se persistir, rode `npm run db:init` manualmente

## Variáveis Railway automáticas

Railway fornece automaticamente:
- `RAILWAY_PRIVATE_DOMAIN` (ex: mysql.railway.internal)
- `MYSQL_URL` (ex: mysql://root:pass@host:port/db)
- `MYSQL_DATABASE` (ex: railway)

Seu código já lê todas essas automaticamente.

## Conectar o bot Discord

Após o backend estar rodando:

1. Convide o bot para seu servidor Discord
2. Rode `/painel` ou `/loja` para testar
3. Logs aparecerão em Railway → Logs

---

Se tiver dúvidas, check os logs no Railway Dashboard.
