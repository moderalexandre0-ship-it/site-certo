# NexosPay

NexosPay é um sistema de vendas automatizadas para Discord com painel web, backend em Node.js e integração com MySQL e Mercado Pago.

## Estrutura do projeto

- `backend/` - API REST, autenticação Discord OAuth2, painel web e integrações de pagamento.
- `bot/` - Bot Discord com comandos, embeds e automações de pedidos.
- `.env.example` - configurações sensíveis e tokens.

## Instalação

1. Copie `.env.example` para `.env`.
2. Preencha as variáveis de ambiente.
3. Rode `npm install`.
4. Inicie o backend com `npm start`.
5. Inicie o bot com `npm run bot`.

> O backend já sincroniza as tabelas automaticamente ao iniciar. Use `npm run db:init` apenas se quiser criar dados de exemplo ou recriar a base manualmente.

## Usando MySQL no Railway

Se estiver usando Railway, prefira configurar `DATABASE_URL` no `.env`:

```env
DATABASE_URL=mysql://root:yourRailwayPassword@yourHost:yourPort/PayNexusLTD?ssl=true
```

Se precisar, também pode usar as variáveis separadas:

```env
DATABASE_HOST=yourHost
DATABASE_PORT=yourPort
DATABASE_NAME=PayNexusLTD
DATABASE_USER=root
DATABASE_PASSWORD=yourRailwayPassword
```

### Notas importantes

- O app suporta `DATABASE_URL` ou `MYSQL_URL`.
- O projeto tentará criar o banco se ele não existir.
- As tabelas são criadas automaticamente com `sequelize.sync()`.

## Comandos do bot

- `/painel`
- `/loja`
- `/comprar`
- `/criar-produto`
- `/remover-produto`
- `/set-canal-log`
- `/set-config`
- `/ver-pedidos`

## Rotas importantes

- `GET /api/products`
- `POST /api/orders`
- `POST /api/payments/create`
- `POST /api/webhooks/mercadopago`
- `GET /api/auth/login`
- `GET /api/auth/callback`




