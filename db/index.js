const mysql = require('mysql2');
require('dotenv').config({ path: './.env' });

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
);

module.exports = connection;