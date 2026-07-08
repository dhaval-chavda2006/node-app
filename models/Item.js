// models/Item.js
// Defines the Item model (our "Notes/Tasks") using Sequelize.
// This maps to the "Items" table in PostgreSQL.
//
// Relationship:
//   One User has MANY Items (One-to-Many)
//   Each Item BELONGS TO one User (via the 'userId' foreign key)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define the Item model
const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200],    // Title must be between 1 and 200 characters
      notEmpty: true
    }
  },

  description: {
    type: DataTypes.TEXT,   // TEXT allows longer content than STRING
    allowNull: true         // Description is optional
  },

  // 'userId' is the FOREIGN KEY that links each item to a specific user.
  // This enforces the "each item belongs to a user" relationship.
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',   // References the 'Users' table
      key: 'id'         // The primary key column in 'Users'
    }
  }
}, {
  tableName: 'Items',
  timestamps: true
});

module.exports = Item;
