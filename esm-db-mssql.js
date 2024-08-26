//@ts-check
import { connect } from 'mssql';

const conn_str = process.env['SQL_CONNECTION_STRING'];

let pool;

(async function init() {
  try {
    if (!conn_str) throw new Error('SQL_CONNECTION_STRING not set');
    pool = await connect(conn_str);
    console.log('Connected to database');
  } catch (err) {
    console.error(err.message + ': ' + conn_str);
  }
})();


process.on('SIGINT', () => {
  pool.close();
  process.exit(1);
});

const query = async (...params) => {
  const result = await pool.query(...params);
  return result.recordsets;
};

export default { query };