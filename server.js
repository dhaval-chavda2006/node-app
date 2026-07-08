// server.js
// The entry point for the application.
// Responsible for:
//   1. Connecting to the PostgreSQL database
//   2. Syncing Sequelize models (creating tables if they don't exist)
//   3. Starting the HTTP server

const app = require('./app');
const sequelize = require('./config/database');
const User = require('./models/User');
const Item = require('./models/Item');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// --- Define Model Associations ---
// This sets up the One-to-Many relationship between User and Item.
// Must be done BEFORE sequelize.sync() is called.
//
// hasMany: User can have many Items
// belongsTo: Item belongs to one User
// onDelete: 'CASCADE' means when a user is deleted, all their items are also deleted
// foreignKey: 'userId' is the column in the Items table that references Users.id

User.hasMany(Item, {
  foreignKey: 'userId',
  as: 'items',          // Alias — lets us do user.getItems()
  onDelete: 'CASCADE'   // Delete all items when the user is deleted
});

Item.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner'           // Alias — lets us do item.getOwner()
});

// --- Database Connection & Server Start ---
// We use an async IIFE (Immediately Invoked Function Expression)
// to allow async/await at the top level

(async () => {
  try {
    // Test the database connection
    // sequelize.authenticate() sends a test query to check connectivity
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models with the database
    // { alter: true } will UPDATE existing tables to match the model definition
    // For production, use Sequelize migrations instead of sync
    //
    // Options:
    //   { force: true }  → Drop and recreate all tables (USE WITH CAUTION — loses data!)
    //   { alter: true }  → Alter tables to match models (safer)
    //   {}               → Only create tables that don't exist yet (safest)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced successfully.');

    // Start the HTTP server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running!`);
      console.log(`   Local:    http://localhost:${PORT}`);
      console.log(`   Login:    http://localhost:${PORT}/login`);
      console.log(`   Register: http://localhost:${PORT}/register`);
      console.log(`\n   Press Ctrl+C to stop the server.\n`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('\nCommon causes:');
    console.error('  1. PostgreSQL is not running. Start it with: sudo service postgresql start');
    console.error('  2. Wrong DB credentials in .env file');
    console.error('  3. Database "crud_db" does not exist. Create it with: createdb crud_db');
    process.exit(1);   // Exit the process with an error code
  }
})();
