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

function createGet({ name, select, field_names, key_names }) {
  const selectList = field_names.map(f => `      ${f}`).join(',\n');
  select = select || `SELECT\n${selectList}\n    FROM ${name}`;

  const where = !key_names || key_names.length === 0 ? '' :
    `WHERE
${key_names.map(f => `      ${f} = \${${f}}`).join(' AND\n')}`;

  return `
    const query = \`${select} ${where}\`;
`;
}

function createPost({ name, field_names }) {
  return `
    const query = \`INSERT INTO ${name} (
${field_names.map(f => `      ${f}`).join(',\n')}
    ) VALUES (
${field_names.map(f => `      \${${f}}`).join(',\n')}
    )\`;
`;

}

function createPut({ name, field_names, key_names }) {
  return `
    const query = \`MERGE INTO ${name} WITH (HOLDLOCK) AS target
    USING (VALUES (
${field_names.map(f => `      \${${f}}`).join(',\n')}
    )) AS source (
${field_names.map(f => `      ${f}`).join(',\n')}
    ) ON (
${key_names.map(f => `      target.${f} = source.${f}`).join(' AND\n')}
    )
    WHEN MATCHED THEN
      UPDATE SET
${field_names.map(f => `      ${f} = source.${f}`).join(',\n')}
    WHEN NOT MATCHED THEN
      INSERT (
${field_names.map(f => `        ${f}`).join(',\n')}
      ) VALUES (
${field_names.map(f => `        source.${f}`).join(',\n')}
      );\`;
`;

}

function createDelete({ name, key_names }) {
  return `
    const query = \`DELETE FROM ${name} WHERE
${key_names.map(f => `      ${f} = \${${f}}`).join(' AND\n')}\`;
`;
}

function createPatch({ name, field_names, key_names }) {
  return `
    const query = \`UPDATE ${name} SET
${field_names.map(f => `      ${f} = \${${f}}`).join(',\n')}
    WHERE
${key_names.map(f => `      ${f} = \${${f}}`).join(' AND\n')}\`;
`;
}

function createStoredProcedure({ name, fields }) {
  return `
  "${name}": async ({
    ${fields.map(f => `${f.name}`).join(', ')}
  }) => {
    const result = await sql.query\`EXEC ${name}
      ${fields.map(f => `\${${f.name}}`).join(', ')}\`;
    return result.recordset;
  },
`
}

const create_sql = (path) => {
  switch (path.method) {
    case 'get':
      return createGet(path);
    case 'post':
      return createPost(path);
    case 'put':
      return createPut(path);
    case 'delete':
      return createDelete(path);
    case 'patch':
      return createPatch(path);
  }
};


const create_method = path => {
  const { name, func, method } = path;
  let inputs = path.field_names.join(', ');
  if (method === 'get' || method === 'delete') {
    inputs = path.key_names.join(', ');
  }

  return `  "${func}": async (${inputs}) => {
    ${create_sql(path)}
    const result = await sql.query(query);
    return result.recordset;
  },
  `
};

const create_model = database => `
module.exports.${database.name} = {

${database.paths.map(path => {

  if (path.type === 'procedure') {
    return createStoredProcedure(path);
  } else if (path.type === 'query') {
    path.select = database.objects.find(o => o.query === path.name).select;
  }
  return create_method(path);

}).join('\n')}
}`;

module.exports = ({ databases }) => {

  const models = !databases || !databases.length ? '' :
    databases.map(d => create_model(d)).join('\n');

  return `${init}
${connect}
${close}
${models}
`;

}