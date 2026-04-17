-- NexosPay Database Schema
-- Crie o banco: CREATE DATABASE IF NOT EXISTS nexospay;
-- Use: USE nexospay;
-- Depois execute este script

-- 1. Tabela Users
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

-- 2. Tabela Products
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

-- 3. Tabela Orders
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

-- 4. Tabela Payments
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

-- 5. Tabela UserGuilds
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

-- 6. Tabela GuildConfigs
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

-- 7. Tabela Logs
CREATE TABLE IF NOT EXISTS `Logs` (
  `id` INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `guildId` VARCHAR(255),
  `userId` INTEGER UNSIGNED,
  `action` VARCHAR(255) NOT NULL,
  `details` LONGTEXT,
  `level` VARCHAR(255) DEFAULT 'info',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar índices para melhor performance
CREATE INDEX idx_products_userId ON Products(userId);
CREATE INDEX idx_products_active ON Products(active);
CREATE INDEX idx_orders_userId ON Orders(userId);
CREATE INDEX idx_orders_productId ON Orders(productId);
CREATE INDEX idx_orders_status ON Orders(status);
CREATE INDEX idx_orders_paymentStatus ON Orders(paymentStatus);
CREATE INDEX idx_payments_orderId ON Payments(orderId);
CREATE INDEX idx_payments_status ON Payments(status);
CREATE INDEX idx_userguilds_userId ON UserGuilds(userId);
CREATE INDEX idx_userguilds_guildId ON UserGuilds(guildId);
CREATE INDEX idx_guildconfigs_guildId ON GuildConfigs(guildId);
CREATE INDEX idx_logs_guildId ON Logs(guildId);
CREATE INDEX idx_logs_userId ON Logs(userId);
CREATE INDEX idx_logs_level ON Logs(level);
CREATE INDEX idx_logs_createdAt ON Logs(createdAt);
