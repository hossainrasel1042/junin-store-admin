import { Sequelize } from 'sequelize';
import pg from 'pg';

const globalForSequelize = globalThis;

export const sequelize =
  globalForSequelize.sequelize ||
  new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg, 
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForSequelize.sequelize = sequelize;
}