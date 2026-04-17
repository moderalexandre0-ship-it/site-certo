# ⚠️ IMPORTANTE - Configuração Railway

## O que está acontecendo?

Railway está tentando iniciar, mas as variáveis de ambiente `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD` não estão sendo lidas.

Isso significa que você ainda **não configurou as variáveis no Railway Dashboard**.

## Solução - Configure agora no Railway Dashboard

### Passo 1: Acesse o Railway Dashboard
- Vá em [railway.app](https://railway.app)
- Selecione seu projeto
- Clique no serviço Node (seu backend)

### Passo 2: Clique em "Variables" no topo

### Passo 3: Adicione **EXATAMENTE** estas variáveis

Copie e cole cada uma:

#### Do seu MySQL do Railway:

```
MYSQL_URL
mysql://root:kLwORRWldJGgVyJtxfykQAfjIhBGUJNh@mysql.railway.internal:3306/railway
```

OU use as variáveis separadas:

```
MYSQL_HOST
mysql.railway.internal

MYSQL_PORT
3306

MYSQL_DATABASE
railway

MYSQL_USER
root

MYSQL_PASSWORD
kLwORRWldJGgVyJtxfykQAfjIhBGUJNh
```

#### Discord:

```
DISCORD_TOKEN
YOUR_DISCORD_TOKEN_HERE

DISCORD_CLIENT_ID
1493935131256295576

DISCORD_CLIENT_SECRET
YOUR_DISCORD_CLIENT_SECRET_HERE

DISCORD_BOT_PREFIX
$
```

#### Outras:

```
BOT_API_KEY
070731

MERCADO_PAGO_ACCESS_TOKEN
YOUR_MERCADO_PAGO_TOKEN_HERE

SESSION_SECRET
qualquer-chave-aleatoria-aqui-pode-ser-qualquer-coisa

BACKEND_PORT
3000

FRONTEND_URL
http://localhost:3000

API_BASE_URL
http://localhost:3000/api
```

### Passo 4: Salve as variáveis

Clique no botão "Save" ou "Deploy" no Railway Dashboard

### Passo 5: Acompanhe o deploy

- Vá em "Deployments"
- Seu deploy deve aparecer como "Building" → "Deploying" → "Success"
- Clique nele para ver os logs

## Esperado nos Logs

Você deve ver algo como:

```
📡 Database URL parsed: { host: 'mysql.railway.internal', database: 'railway' }
✅ MySQL conectado com sucesso.
✅ Tabelas sincronizadas.
✅ NexosPay backend rodando em http://seu-dominio.railway.app
```

## Se ainda der erro

1. Volte no Railway Dashboard
2. Verifique se as variáveis estão SALVAS (não apenas escritas)
3. Clique em "Redeploy" para forçar novo deploy
4. Aguarde ~5 minutos para o deploy terminar

## Checklist Final

- [ ] Acessou railway.app
- [ ] Selecionou seu serviço Node
- [ ] Clicou em "Variables"
- [ ] Adicionou `MYSQL_URL` ou `MYSQL_HOST/USER/PASSWORD/DATABASE`
- [ ] Adicionou variáveis Discord
- [ ] Clicou em "Save" ou "Deploy"
- [ ] Aguardou deploy terminar
- [ ] Verificou os logs em "Deployments"
