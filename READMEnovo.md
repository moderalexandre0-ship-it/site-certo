# NexosPay - README Novo

## Objetivo

Este arquivo documenta como configurar o banco de dados MySQL para o projeto NexosPay usando um serviço online como Railway. O bot e o site/back-end usam o mesmo banco.

## Configuração de ambiente

1. Crie um arquivo `.env` na raiz do projeto.
2. Copie os valores do `.env.example` e preencha com seus dados reais.
3. Não commit o `.env` no Git.

### Variáveis necessárias

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_PREFIX`
- `DISCORD_WEBHOOK_SECRET`
- `BOT_API_KEY`
- `DATABASE_HOST` ou `DATABASE_URL`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_PUBLIC_KEY`
- `FRONTEND_URL`
- `BACKEND_PORT`
- `API_BASE_URL`
- `SESSION_SECRET`

### Exemplo de `.env` usando Railway

Se o Railway oferecer um URL de conexão único, use:

```env
DATABASE_URL=mysql://root:yourpassword@your-host:3306/PayNexusLTD
```

Se usar variáveis separadas, defina:

```env
DATABASE_HOST=your-host
DATABASE_PORT=3306
DATABASE_NAME=PayNexusLTD
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
```

> O projeto agora suporta `DATABASE_URL` ou `MYSQL_URL` automaticamente.

## Como usar com Railway

1. Crie o serviço MySQL no Railway.
2. Obtenha as credenciais: host, porta, database, usuário e senha.
3. Coloque esses valores no `.env`.
4. Execute o backend com:

```bash
npm install
npm start
```

5. Se quiser rodar o bot também:

```bash
npm run bot
```

6. Se precisar criar as tabelas manualmente, execute:

```bash
npm run db:init
```

## Tabelas necessárias

O projeto exige estas tabelas no banco MySQL:

### 1. Users

```sql
CREATE TABLE IF NOT EXISTS `Users` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `discordId` VARCHAR(255) UNIQUE NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `discriminator` VARCHAR(255),
  `avatar` VARCHAR(255),
  `email` VARCHAR(255),
  `role` VARCHAR(255) DEFAULT 'user',
  `walletBalance` INTEGER UNSIGNED DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Products

```sql
CREATE TABLE IF NOT EXISTS `Products` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `userId` INTEGER UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` LONGTEXT,
  `priceCents` INTEGER UNSIGNED NOT NULL,
  `currency` VARCHAR(8) DEFAULT 'BRL',
  `stock` INTEGER UNSIGNED DEFAULT 9999,
  `active` BOOLEAN DEFAULT true,
  `deliveryType` VARCHAR(255) DEFAULT 'automatica',
  `announcementGuildId` VARCHAR(255),
  `announcementChannelId` VARCHAR(255),
  `announced` BOOLEAN DEFAULT false,
  `announcedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Orders

```sql
CREATE TABLE IF NOT EXISTS `Orders` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `userId` INTEGER UNSIGNED NOT NULL,
  `productId` INTEGER UNSIGNED NOT NULL,
  `guildId` VARCHAR(255),
  `quantity` INTEGER UNSIGNED DEFAULT 1,
  `totalCents` INTEGER UNSIGNED NOT NULL,
  `status` VARCHAR(255) DEFAULT 'pending',
  `paymentStatus` VARCHAR(255) DEFAULT 'unpaid',
  `deliveryInfo` LONGTEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `Products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Payments

```sql
CREATE TABLE IF NOT EXISTS `Payments` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `orderId` INTEGER UNSIGNED NOT NULL,
  `externalPaymentId` VARCHAR(255),
  `status` VARCHAR(255) DEFAULT 'pending',
  `method` VARCHAR(255) DEFAULT 'pix',
  `amountCents` INTEGER UNSIGNED NOT NULL,
  `currency` VARCHAR(8) DEFAULT 'BRL',
  `qrCode` LONGTEXT,
  `pixCopyPaste` LONGTEXT,
  `checkoutLink` LONGTEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`orderId`) REFERENCES `Orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. UserGuilds

```sql
CREATE TABLE IF NOT EXISTS `UserGuilds` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `userId` INTEGER UNSIGNED NOT NULL,
  `guildId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255),
  `permissions` VARCHAR(255) NOT NULL,
  `owner` BOOLEAN DEFAULT false,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. GuildConfigs

```sql
CREATE TABLE IF NOT EXISTS `GuildConfigs` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `guildId` VARCHAR(255) UNIQUE NOT NULL,
  `adminRoleId` VARCHAR(255),
  `logChannelId` VARCHAR(255),
  `paymentChannelId` VARCHAR(255),
  `defaultCurrency` VARCHAR(8) DEFAULT 'BRL',
  `botName` VARCHAR(255),
  `botLogo` VARCHAR(255),
  `botCover` VARCHAR(255),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7. Logs

A tabela de logs é criada via Sequelize usando a model `Log`.

```sql
CREATE TABLE IF NOT EXISTS `Logs` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `guildId` VARCHAR(255),
  `userId` INTEGER UNSIGNED,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT,
  `level` VARCHAR(255) NOT NULL DEFAULT 'info',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Observações importantes

- O arquivo `.env.example` deve permanecer com placeholders.
- Use o arquivo `.env` local para credenciais reais.
- Se Railway fornecer `DATABASE_URL`, não é necessário usar `DATABASE_HOST`, `DATABASE_USER`, etc. O backend já aceita esse formato.
- Se preferir, mantenha `DATABASE_NAME=PayNexusLTD` e as credenciais de root no `.env` local.

## Comandos úteis

```bash
npm install
npm start
npm run bot
npm run db:init
```

## Como testar

1. Preencha `.env` com seu banco Railway.
2. Rode `npm start`.
3. Caso falhe por falta de tabela, execute `npm run db:init`.
4. Abra `http://localhost:3000` para verificar o painel.

---

Se quiser, posso também adicionar um arquivo `setup-railway.md` separado com instruções passo a passo para criar o serviço Railway e ligar o projeto a ele.