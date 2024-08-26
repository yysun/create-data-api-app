import 'dotenv/config';
import { createPool } from 'mysql2';
import SQL from 'sql-template-strings';

var db = createPool({
  connectionLimit: 4,
  host: process.env['MYSQL_SERVER'],
  user: process.env['MYSQL_USER'],
  password: process.env['MYSQL_PASSWORD'],
  database: process.env['MYSQL_DATABASE'],
}).promise();

process.on('SIGINT', () => {
  db.end();
  process.exit(1);
});

const query = async (...params) => {
  const sql = SQL(...params);
  const result = await db.query(sql);
  return result[0];
};

export default { query };
