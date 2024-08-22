require('dotenv').config()
const mysql = require('mysql2')
const SQL = require('sql-template-strings')

var db = mysql.createPool({
  connectionLimit: 4,
  host: process.env['MYSQL_SERVER'],
  user: process.env['MYSQL_USER'],
  password: process.env['MYSQL_PASSWORD'],
  database: process.env['MYSQL_DATABASE'],
}).promise();

process.on('SIGINT', () => {
  db.end();
});

const query = async (...params) => {
  const sql = SQL(...params);
  const result = await db.query(sql);
  return result[0];
};

module.exports = { query };
