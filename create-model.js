const fields_list = fields => fields.map(f => {

  const [type, name, keys, comment] = f.split(' ');
  const pk = keys?.indexOf('PK') > -1;
  return { type, name, pk, comment };
});



const init = `
require('dotenv').config();
const sql = require('mssql');
const conn_str = process.env['SQL_CONNECTION_STRING'];`;

const connect = `
(async function connect() {
  try {
    await sql.connect(conn_str);
    console.log('Connected to database');
  } catch (err) {
    console.error(err);
  }
})();`;

const close = `
process.on('SIGINT', () => {
  sql.close(() => {
    console.log('Database connection closed');
    process.exit();
  });
});`;

function createGet({ name, from, fields, id }) {
  const fieldsList = fields_list(fields);
  const selectList = fieldsList.map(f => `      ${f.name}`).join(',\n');
  const pk = fieldsList.find(f => f.pk)?.name;
  id = id || pk;
  from = from || name;
  const query = `SELECT\n${selectList} FROM ${from}`;

  const getByPk =
    `  getOne: async ${id} => {
    const result = await sql.query\`${query} WHERE ${pk} = \${${id}}\`;
    return result.recordset;
  },
`;

  const getAll =
    `  getAll: async () => {
    const result = await sql.query\`${query}\`;
    return result.recordset;
  },
`;
  return `
${getByPk}
${getAll}`;
}


function createPost() {

}

function createPut() {

}

function createDelete() {

}

function createPatch() {

}

function createStoredProcedure({ name, fields}) {
  const fieldsList = fields_list(fields);

  return `
module.exports.${name} = async ({
  ${fieldsList.map(f => `${f.name}`).join(', ')}
}) => {

  const result = await sql.query\`EXEC ${name}
    ${fieldsList.map(f => `\${${f.name}}`).join(', ')}\`;
  return result.recordset;
}
`
}

module.exports = entities => {

  const model_method = (method, entity) => {
    method = method.trim().toLowerCase();
    switch (method) {
      case 'get':
        return createGet(entity);
      case 'post':
        return createPost(entity);
      case 'put':
        return createPut(entity);
      case 'delete':
        return createDelete(entity);
      case 'patch':
        return createPatch(entity);
    }
  };


  const entity_model = e => {

    if (e.type === 'stored procedure') {
      return createStoredProcedure(e);
    } else {
      const methods = e.methods.split(',');
      return `
module.exports.${e.name} = {
  ${methods.map(method => model_method(method, e)).join('')}
}`;
    }
  };

  const models = !entities || !entities.length ? '' :
    entities.map(e => entity_model(e)).join('\n');

  return `${init}
${connect}
${close}
${models}
`;

}