// models/User.js
// Defines the User model using Sequelize.
// This maps directly to the "Users" table in PostgreSQL.
//
// Sequelize models allow us to:
//   - Create records: User.create({ ... })
//   - Find records:   User.findOne({ where: { email } })
//   - Update records: user.update({ ... })
//   - Delete records: user.destroy()

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define the User model
// DataTypes defines the data type for each column (STRING, INTEGER, etc.)
const User = sequelize.define('User', {
  // 'id' is automatically added by Sequelize as an auto-incrementing primary key
  // We explicitly define it here for clarity
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,   // This column cannot be null (required)
    validate: {
      len: [2, 50],     // Must be between 2 and 50 characters
      notEmpty: true    // Must not be an empty string
    }
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,       // No two users can share the same email
    validate: {
      isEmail: true,    // Sequelize will validate email format
      notEmpty: true
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [4, 100],    // At least 4 characters (will be hashed, so max is longer)
      notEmpty: true
    }
  }
}, {
  // Sequelize options
  tableName: 'Users',       // Explicit table name in the database
  timestamps: true           // Automatically manages createdAt and updatedAt
});

// --- HOOKS ---
// Hooks (also called "lifecycle callbacks") run at specific points during operations.
// This 'beforeCreate' hook runs BEFORE a new User is saved to the database.
// We use it to hash the password so we never store plain text passwords.
User.beforeCreate(async (user) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
  // bcrypt.hash(password, saltRounds) generates a secure hash
  // The higher the saltRounds, the more secure (but slower) the hash
  user.password = await bcrypt.hash(user.password, saltRounds);
});

// This 'beforeUpdate' hook runs BEFORE an existing User record is updated.
// If the password field was changed, we re-hash it.
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

/**
 * Instance method to compare a plain text password with the stored hash.
 * Usage: const isMatch = await user.comparePassword('mypassword');
 * @param {string} plainPassword - The plain text password to check
 * @returns {boolean} - true if passwords match, false otherwise
 */
User.prototype.comparePassword = async function (plainPassword) {
  // bcrypt.compare() returns true if the plain password matches the hash
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = User;
