const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL;
let DB_NAME = process.env.DATABASE_NAME || process.env.MYSQLDATABASE;
let DB_HOST = process.env.DATABASE_HOST || process.env.MYSQLHOST;
let DB_PORT = process.env.DATABASE_PORT || process.env.MYSQLPORT;
let DB_USER = process.env.DATABASE_USER || process.env.MYSQLUSER;
let DB_PASSWORD = process.env.DATABASE_PASSWORD || process.env.MYSQLPASSWORD;
let DB_SSL = false;

if (DATABASE_URL) {
  const url = new URL(DATABASE_URL);
  DB_NAME = url.pathname ? url.pathname.slice(1) : DB_NAME;
  DB_HOST = url.hostname;
  DB_PORT = url.port ? Number(url.port) : 3306;
  DB_USER = url.username || DB_USER;
  DB_PASSWORD = url.password || DB_PASSWORD;
  const sslQuery = url.searchParams.get('ssl') || url.searchParams.get('sslmode');
  DB_SSL = sslQuery === 'true' || sslQuery === 'require';
}

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error('Missing database configuration. Set DATABASE_URL or DATABASE_HOST/DATABASE_USER/DATABASE_PASSWORD/DATABASE_NAME or the Railway MYSQL_* equivalents.');
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
