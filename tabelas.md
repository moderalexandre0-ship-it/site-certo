# 📊 Documentação das Tabelas do NexosPay

## Visão Geral
NexosPay utiliza **7 tabelas principais** no banco de dados MySQL para gerenciar usuários, produtos, pedidos, pagamentos, configurações de servidores Discord e logs.

---

## 1. **Users** (Usuários)
Armazena informações dos usuários Discord autenticados.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| `id` | INTEGER UNSIGNED | PRIMARY KEY, AUTO INCREMENT | ID único do usuário |
| `discordId` | STRING | UNIQUE, NOT NULL | ID do Discord do usuário |
| `username` | STRING | NOT NULL | Nome de usuário do Discord |
| `discriminator` | STRING | NULLABLE | Número de discriminador (ex: #0001) |
| `avatar` | STRING | NULLABLE | Hash do avatar do Discord |
| `email` | STRING | NULLABLE | Email do usuário Discord |
| `role` | STRING | DEFAULT 'user' | Role do usuário (user, admin) |
| `walletBalance` | INTEGER UNSIGNED | DEFAULT 0 | Saldo da carteira em centavos |
| `createdAt` | TIMESTAMP | - | Data de criação |
| `updatedAt` | TIMESTAMP | - | Data de última atualização |

---

## 2. **Products** (Produtos)
Armazena todos os produtos criados pelos vendedores.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| `id` | INTEGER UNSIGNED | PRIMARY KEY, AUTO INCREMENT | ID único do produto |
| `userId` | INTEGER UNSIGNED | FOREIGN KEY (Users.id) | Criador do produto |
| `name` | STRING | NOT NULL | Nome do produto |
| `description` | TEXT | NULLABLE | Descrição detalhada |
| `priceCents` | INTEGER UNSIGNED | NOT NULL | Preço em centavos (R$ 10.50 = 1050) |
| `currency` | STRING(8) | DEFAULT 'BRL' | Moeda (BRL, USD, etc) |
| `stock` | INTEGER UNSIGNED | DEFAULT 9999 | Quantidade em estoque |
| `active` | BOOLEAN | DEFAULT true | Produto ativo ou não |
| `deliveryType` | STRING | DEFAULT 'automatica' | Tipo de entrega (automatica, manual) |
| `announcementGuildId` | STRING | NULLABLE | ID do servidor para anúncio |
| `announcementChannelId` | STRING | NULLABLE | ID do canal para anúncio |
| `announced` | BOOLEAN | DEFAULT false | Produto já foi anunciado |
| `announcedAt` | TIMESTAMP | NULLABLE | Data do anúncio |
| `createdAt` | TIMESTAMP | - | Data de criação |
| `updatedAt` | TIMESTAMP | - | Data de última atualização |

---

## 3. **Orders** (Pedidos)
Armazena todos os pedidos realizados pelos usuários.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| `id` | INTEGER UNSIGNED | PRIMARY KEY, AUTO INCREMENT | ID único do pedido |
| `userId` | INTEGER UNSIGNED | NOT NULL | Usuário que fez o pedido |
| `productId` | INTEGER UNSIGNED | NOT NULL | Produto do pedido |
| `guildId` | STRING | NULLABLE | Servidor Discord do pedido |
| `quantity` | INTEGER UNSIGNED | DEFAULT 1 | Quantidade de unidades |
| `totalCents` | INTEGER UNSIGNED | NOT NULL | Valor total em centavos |
| `status` | STRING | DEFAULT 'pending' | Status (pending, processing, delivered, cancelled) |
| `paymentStatus` | STRING | DEFAULT 'unpaid' | Status do pagamento (unpaid, paid, refunded) |
| `deliveryInfo` | TEXT | NULLABLE | Informações de entrega/rastreamento |
| `createdAt` | TIMESTAMP | - | Data de criação |
| `updatedAt` | TIMESTAMP | - | Data de última atualização |

---

## 4. **Payments** (Pagamentos)
Armazena dados de pagamentos via Mercado Pago ou PIX.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| `id` | INTEGER UNSIGNED | PRIMARY KEY, AUTO INCREMENT | ID único do pagamento |
| `orderId` | INTEGER UNSIGNED | FOREIGN KEY (Orders.id) | Pedido associado |
| `externalPaymentId` | STRING | NULLABLE | ID de pagamento do Mercado Pago |
| `status` | STRING | DEFAULT 'pending' | Status (pending, approved, rejected, refunded) |
| `method` | STRING | DEFAULT 'pix' | Método (pix, credit_card, boleto) |
| `amountCents` | INTEGER UNSIGNED | NOT NULL | Valor em centavos |
| `currency` | STRING(8) | DEFAULT 'BRL' | Moeda |
| `qrCode` | TEXT | NULLABLE | QR Code do PIX (base64) |
| `pixCopyPaste` | TEXT | NULLABLE | String copy-paste do PIX |
| `checkoutLink` | TEXT | NULLABLE | Link do checkout Mercado Pago |
| `createdAt` | TIMESTAMP | - | Data de criação |
| `updatedAt` | TIMESTAMP | - | Data de última atualização |

---

## 5. **UserGuilds** (Servidores do Usuário)
Armazena os servidores Discord gerenciados por cada usuário.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| `id` | INTEGER UNSIGNED | PRIMARY KEY, AUTO INCREMENT | ID único |
| `userId` | INTEGER UNSIGNED | FOREIGN KEY (Users.id) | Usuário proprietário |
| `guildId` | STRING | NOT NULL | ID do servidor Discord |
| `name` | STRING | NOT NULL | Nome do servidor |
| `icon` | STRING | NULLABLE | Hash do ícone do servidor |
| `permissions` | STRING | NOT NULL | Bitfield de permissões |
| `owner` | BOOLEAN | DEFAULT false | Usuário é dono do servidor |
| `createdAt` | TIMESTAMP | - | Data de criação |
| `updatedAt` | TIMESTAMP | - | Data de última atualização |

---

## 6. **GuildConfigs** (Configurações de Servidor)
Armazena customizações de cada servidor Discord.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| `id` | INTEGER UNSIGNED | PRIMARY KEY, AUTO INCREMENT | ID único |
| `guildId` | STRING | UNIQUE, NOT NULL | ID do servidor Discord |
| `adminRoleId` | STRING | NULLABLE | Role que gerencia o bot |
| `logChannelId` | STRING | NULLABLE | Canal para logs de eventos |
| `paymentChannelId` | STRING | NULLABLE | Canal para notificações de pagamento |
| `defaultCurrency` | STRING(8) | DEFAULT 'BRL' | Moeda padrão do servidor |
| `botName` | STRING | NULLABLE | Nome customizado do bot |
| `botLogo` | STRING | NULLABLE | URL do logo do bot |
| `botCover` | STRING | NULLABLE | URL da capa/banner do bot |
| `createdAt` | TIMESTAMP | - | Data de criação |
| `updatedAt` | TIMESTAMP | - | Data de última atualização |

---

## 7. **Logs** (Registros de Eventos)
Armazena logs de ações no sistema para auditoria.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-----------|-----------|
| `id` | INTEGER UNSIGNED | PRIMARY KEY, AUTO INCREMENT | ID único |
| `guildId` | STRING | NULLABLE | Servidor onde ocorreu a ação |
| `userId` | INTEGER UNSIGNED | NULLABLE | Usuário que realizou a ação |
| `action` | STRING | NOT NULL | Tipo de ação (CREATE_PRODUCT, DELETE_PRODUCT, etc) |
| `details` | TEXT | NULLABLE | Detalhes adicionais em JSON |
| `level` | STRING | DEFAULT 'info' | Nível do log (info, warning, error) |
| `createdAt` | TIMESTAMP | - | Data/hora do evento |
| `updatedAt` | TIMESTAMP | - | Data de última atualização |

---

## Relacionamentos

```
Users
├── 1:N → Products (userId)
├── 1:N → Orders (userId)
├── 1:N → UserGuilds (userId)
└── 1:N → Logs (userId)

Products
├── N:1 ← Users (userId)
└── 1:N → Orders (productId)

Orders
├── N:1 ← Users (userId)
├── N:1 ← Products (productId)
└── 1:1 → Payments (orderId)

Payments
└── 1:N ← Orders (orderId)

UserGuilds
└── N:1 ← Users (userId)

GuildConfigs
└── 1 por servidor Discord único (guildId)

Logs
├── N:1 ← Users (userId)
└── N:1 ← GuildConfigs (guildId)
```

---

## Índices Principais

- **Users**: `discordId` (UNIQUE)
- **Products**: `userId` (FK), `active`
- **Orders**: `userId`, `productId`, `status`, `paymentStatus`
- **Payments**: `orderId`, `externalPaymentId`, `status`
- **UserGuilds**: `userId`, `guildId`
- **GuildConfigs**: `guildId` (UNIQUE)
- **Logs**: `guildId`, `userId`, `level`, `createdAt`

---

## Sincronização de Banco

O banco é sincronizado automaticamente ao iniciar:

1. **Backend**: `npm start` executa `sequelize.sync({ alter: true })`
2. **Bot**: `npm run bot` executa `sequelize.sync({ alter: true })`
3. **Manual**: `npm run db:init` força criação de banco e sync

O parâmetro `alter: true` permite que novas colunas sejam adicionadas automaticamente sem perder dados existentes.

---

## Dicas de Consulta

### Obter todos os produtos de um usuário
```sql
SELECT * FROM Products WHERE userId = ? AND active = true;
```

### Listar servidores gerenciados por um usuário
```sql
SELECT * FROM UserGuilds WHERE userId = ?;
```

### Ver histórico de vendas
```sql
SELECT o.*, p.name as productName, u.username as buyerName
FROM Orders o
JOIN Products p ON o.productId = p.id
JOIN Users u ON o.userId = u.id
ORDER BY o.createdAt DESC;
```

### Verificar pagamentos pendentes
```sql
SELECT p.*, o.id as orderId
FROM Payments p
JOIN Orders o ON p.orderId = o.id
WHERE p.status = 'pending'
AND p.createdAt < DATE_SUB(NOW(), INTERVAL 30 MINUTE);
```

---

**Última atualização**: 16 de Abril de 2026
