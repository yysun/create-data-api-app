//@ts-check
const db = require('mssql');

const conn_str = process.env['SQL_CONNECTION_STRING'];

(async function connect() {
  try {
    if (!conn_str) throw new Error('SQL_CONNECTION_STRING not set');
    await db.connect(conn_str);
    console.log('Connected to database');
  } catch (err) {
    console.error(err.message + ': ' + conn_str);
  }
})();


//process.on('SIGINT', () => db.close());

const query = async (sql, ...params) => {
  const result = await db.query(sql, ...params);
  return result.recordsets;
};

module.exports = { query };