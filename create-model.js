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

function createGet({ name, fields, keys }) {
  const pk = fields.find(f => f.pk)?.name;
  const selectList = fields.map(f => `      ${f.name}`).join(',\n');

  const query = `SELECT\n${selectList} FROM ${name}`;
  const find =
    `  find: async ${pk} => {
    const result = await sql.query\`${query} WHERE ${pk} = \${${pk}}\`;
    return result.recordset;
  },
`;

  const search = `
  search: async ({${keys.join(', ')}}) => {
    const result = await sql.query\`${query} WHERE
${keys.map(f => `      ${f} = \${${f}}`).join(' AND\n')}
    \`;
    return result.recordset;
  },
`;
  return `
${find}
${search}`;
}

function createPost({ name, fields }) {
  const field_names = fields.map(f => f.name);
  return `
  post: async ({${field_names.join(', ')}}) => {
    const query = \`INSERT INTO ${name} (
${field_names.map(f => `      ${f}`).join(',\n')}
    ) VALUES (
${field_names.map(f => `      \${${f}}`).join(',\n')}
    )\`;
    const result = await sql.query\`\${query}\`;
    return result.recordset;
  },
`;

}

function createPut({ name, fields, keys }) {
  const field_names = fields.map(f => f.name);
  return `
  put: async ({${field_names.join(', ')}}) => {
    const query = \`MERGE INTO ${name} WITH (HOLDLOCK) AS target
    USING (VALUES (
${field_names.map(f => `      \${${f}}`).join(',\n')}
    )) AS source (
${field_names.map(f => `      ${f}`).join(',\n')}
    ) ON (
${keys.map(f => `      target.${f} = source.${f}`).join(' AND\n')}
    )
    WHEN MATCHED THEN
      UPDATE SET
${field_names.map(f => `      ${f} = source.${f}`).join(',\n')}
    WHEN NOT MATCHED THEN
      INSERT (
${field_names.map(f => `        ${f}`).join(',\n')}
      ) VALUES (
${field_names.map(f => `        source.${f}`).join(',\n')}
      );
    \`;
    const result = await sql.query\`\${query}\`;
    return result.recordset;
  },
`;

}

function createDelete({ name, keys }) {
  return `
  delete: async ({${keys.join(', ')}}) => {
    const query = \`DELETE FROM ${name} WHERE
${keys.map(f => `      ${f} = \${${f}}`).join(' AND\n')}
    \`;
    const result = await sql.query\`\${query}\`;
    return result.recordset;
  },
`;
}

function createPatch({ name, fields, keys }) {
  const field_names = fields.map(f => f.name);
  return `
  patch: async ({${field_names.join(', ')}}) => {
    const query = \`UPDATE ${name} SET
${field_names.map(f => `      ${f} = \${${f}}`).join(',\n')}
    WHERE
${keys.map(f => `      ${f} = \${${f}}`).join(' AND\n')}
    \`;
    const result = await sql.query\`\${query}\`;
    return result.recordset;
  },
`;

}

function createStoredProcedure({ name, fields }) {
  return `
module.exports.${name} = async ({
  ${fields.map(f => `${f.name}`).join(', ')}
}) => {

  const result = await sql.query\`EXEC ${name}
    ${fields.map(f => `\${${f.name}}`).join(', ')}\`;
  return result.recordset;
}
`
}

function createQuery({ name, query, fields }) {
  const field_names = fields.map(f => f.name);
  if (field_names.length === 0) {
    return `
module.exports.${name} = async () => {
    const result = await sql.query\`${query}\`;
    return result.recordset;
  }
`
  } else {
    return `
module.exports.${name} = async ({
  ${field_names.map(f => `${f}`).join(', ')}
}) => {

  const result = await sql.query\`${query} WHERE
${field_names.map(f => `      ${f} = \${${f}}`).join(' AND\n')}
    \`;
  return result.recordset;
}
`;
  }
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
    } else if (e.type === 'query') {
      return createQuery(e);
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