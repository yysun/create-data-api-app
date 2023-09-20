const fields_list = fields => fields.map(f => {

  const [type, name, keys, comment] = f.split(' ');
  const pk = keys?.indexOf('PK') > -1;
  return { type, name, pk, comment };
});


module.exports = {

  init : () =>`
const sql = require('mssql');
const conn_str = process.env['SQL_CONNECTION_STRING'];`,

  connect: () => `
(async function connect() {
  try {
    await sql.connect(conn_str);
    console.log('Connected to database');
  } catch (err) {
    console.error(err);
  }
})();`,

  close: () => `
process.on('SIGINT', () => {
  sql.close(() => {
    console.log('Database connection closed');
    process.exit();
  });
});`,

  createGet({ path, name, fields, id }) {

    const fieldsList = fields_list(fields);
    const selectList = fieldsList.map(f => `  ${f.name}`).join(',\n');
    const pk = fieldsList.find(f => f.pk)?.name;

    const query = `SELECT\n${selectList} FROM ${name}`;

    const getByPk = `
app.get('${path}/:${id}', async (req, res) => {
  const id = req.params.${id};
  const result = await sql.query\`${query} WHERE ${pk} = \${id}\`;
  res.send(result.recordset);
});
`;

    const getAll = id ? '' :`
app.get('${path}', async (req, res) => {
  const result = await sql.query\`${query}\`;
  res.send(result.recordset);
});
`;
    return `
${getByPk}
${getAll}
    `;
  },


  createPost() {

  },

  createPut() {

  },

  createDelete() {

  },

  createPatch() {

  }
}