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
4. Execute `npm run db:init` para criar tabelas no banco.
5. Inicie o backend com `npm start`.
6. Inicie o bot com `npm run bot`.

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




