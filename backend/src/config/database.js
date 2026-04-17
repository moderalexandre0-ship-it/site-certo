const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

// Em desenvolvimento, carrega do .env. Em produção (Railway), já está em process.env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Lê diretamente de process.env (Railway já injeta automaticamente)
const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;
let DB_NAME = process.env.DATABASE_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway';
let DB_HOST = process.env.DATABASE_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST;
let DB_PORT = process.env.DATABASE_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306;
let DB_USER = process.env.DATABASE_USER || process.env.MYSQLUSER || process.env.MYSQL_USER;
let DB_PASSWORD = process.env.DATABASE_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD;
let DB_SSL = false;

// Parse URL if provided
if (DATABASE_URL) {
  try {
    const url = new URL(DATABASE_URL);
    DB_NAME = url.pathname ? url.pathname.slice(1) : DB_NAME;
    DB_HOST = url.hostname;
    DB_PORT = url.port ? Number(url.port) : 3306;
    DB_USER = url.username || DB_USER;
    DB_PASSWORD = url.password || DB_PASSWORD;
    const sslQuery = url.searchParams.get('ssl') || url.searchParams.get('sslmode');
    DB_SSL = sslQuery === 'true' || sslQuery === 'require';
    console.log('📡 Database URL parsed:', { host: DB_HOST, database: DB_NAME });
  } catch (err) {
    console.warn('⚠️  Failed to parse DATABASE_URL:', err.message);
  }
}

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('❌ Database configuration missing:', {
    DB_HOST: DB_HOST ? '✓' : '✗ MISSING',
    DB_USER: DB_USER ? '✓' : '✗ MISSING',
    DB_PASSWORD: DB_PASSWORD ? '✓' : '✗ MISSING',
    DB_NAME: DB_NAME ? '✓' : '✗ MISSING',
    DATABASE_URL_provided: !!DATABASE_URL,
    MYSQL_URL_provided: !!process.env.MYSQL_URL,
    MYSQL_HOST_provided: !!process.env.MYSQL_HOST
  });
  throw new Error('Missing database configuration. Railway should provide MYSQL_* or DATABASE_URL automatically.');
}

const connectionOptions = {
  host: DB_HOST,
  port: Number(DB_PORT) || 3306,
  user: DB_USER,
  password: DB_PASSWORD
};

if (DB_SSL) {
  connectionOptions.ssl = { rejectUnauthorized: false };
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection(connectionOptions);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
}

const sequelizeConfig = {
  host: DB_HOST,
  port: Number(DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: false,
    timestamps: true,
    freezeTableName: false
  }
};

if (DB_SSL) {
  sequelizeConfig.dialectOptions = { ssl: { rejectUnauthorized: false } };
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, sequelizeConfig);

module.exports = { sequelize, ensureDatabaseExists };
