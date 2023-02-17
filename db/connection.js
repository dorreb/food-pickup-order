// PG database client/connection setup
const { Pool } = require("pg");

// const dbParams = {
//   host: process.env.DATABASE_URL,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
// };

// const db = new Pool(dbParams);

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect();

module.exports = db;
