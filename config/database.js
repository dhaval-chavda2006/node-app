// config/database.js
// This file sets up the Sequelize connection to PostgreSQL.
// Sequelize is an ORM (Object Relational Mapper) that lets us work with
// the database using JavaScript objects instead of raw SQL.

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a new Sequelize instance with our database credentials
// These values are pulled from the .env file for security
const sequelize = new Sequelize(
  process.env.DB_NAME,       // Database name (crud_db)
  process.env.DB_USER,       // Database username
  process.env.DB_PASSWORD,   // Database password
  {
    host: process.env.DB_HOST,   // Usually 'localhost'
    port: process.env.DB_PORT,   // Usually 5432
    dialect: 'postgres',          // We're using PostgreSQL

    // Logging: set to false to disable SQL query logs in terminal.
    // Set to console.log to see every query (useful for debugging).
    logging: false,

    pool: {
      max: 5,       // Maximum number of connections in the pool
      min: 0,       // Minimum number of connections in the pool
      acquire: 30000, // Maximum time (ms) to wait for a connection
      idle: 10000    // Time (ms) a connection can sit idle before being released
    }
  }
);

module.exports = sequelize;
