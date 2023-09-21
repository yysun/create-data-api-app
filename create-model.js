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

function createGet({ name, fields, id }) {
  const fieldsList = fields_list(fields);
  const pk = fieldsList.find(f => f.pk)?.name;
  id = id || pk;
  const selectList = fieldsList.map(f => `      ${f.name}`).join(',\n');
  const keys = fields_list(fields).filter(f => f.pk).map(f => f.name) || [id];

  const query = `SELECT\n${selectList} FROM ${name}`;

  const getOne =
    `  getOne: async ${id} => {
    const result = await sql.query\`${query} WHERE ${pk} = \${${id}}\`;
    return result.recordset;
  },
`;

  const getAll = `
  getAll: async ({${keys.join(', ')}}) => {
    const result = await sql.query\`${query} WHERE
${keys.map(f => `      ${f} = \${${f}}`).join(' AND\n')}
    \`;
    return result.recordset;
  },
`;
  return `
${getOne}
${getAll}`;
}


function createPost({ name, fields }) {
  const fieldsList = fields_list(fields).map(f => f.name) || [];
  return `
  post: async ({${fieldsList.join(', ')}}) => {
    const query = \`INSERT INTO ${name} (
${fieldsList.map(f => `      ${f}`).join(',\n')}
    ) VALUES (
${fieldsList.map(f => `      \${${f}}`).join(',\n')}
    )\`;
    const result = await sql.query\`\${query}\`;
    return result.recordset;
  },
`;

}

function createPut({ name, fields }) {
  const keys = fields_list(fields).filter(f => f.pk).map(f => f.name) || [];
  const fieldsList = fields_list(fields).map(f => f.name) || [];
  return `
  put: async ({${fieldsList.join(', ')}}) => {
    const query = \`MERGE INTO ${name} WITH (HOLDLOCK) AS target
    USING (VALUES (
${fieldsList.map(f => `      \${${f}}`).join(',\n')}
    )) AS source (
${fieldsList.map(f => `      ${f}`).join(',\n')}
    ) ON (
${keys.map(f => `      target.${f} = source.${f}`).join(' AND\n')}
    )
    WHEN MATCHED THEN
      UPDATE SET
${fieldsList.map(f => `      ${f} = source.${f}`).join(',\n')}
    WHEN NOT MATCHED THEN
      INSERT (
${fieldsList.map(f => `        ${f}`).join(',\n')}
      ) VALUES (
${fieldsList.map(f => `        source.${f}`).join(',\n')}
      );
    \`;
    const result = await sql.query\`\${query}\`;
    return result.recordset;
  },
`;

}

function createDelete({ name, fields }) {
  const keys = fields_list(fields).filter(f => f.pk).map(f => f.name) || [];
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

function createPatch({ name, fields }) {
  const keys = fields_list(fields).filter(f => f.pk).map(f => f.name) || [];
  const fieldsList = fields_list(fields).map(f => f.name) || [];
  return `
  patch: async ({${fieldsList.join(', ')}}) => {
    const query = \`UPDATE ${name} SET
${fieldsList.map(f => `      ${f} = \${${f}}`).join(',\n')}
    WHERE
${keys.map(f => `      ${f} = \${${f}}`).join(' AND\n')}
    \`;
    const result = await sql.query\`\${query}\`;
    return result.recordset;
  },
`;

}

function createStoredProcedure({ name, fields }) {
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

function createQuery({ name, query, fields }) {
  const fieldsList = fields_list(fields || []).map(f => f.name) || [];
  if (fieldsList.length === 0) {
    return `
module.exports.${name} = async () => {
    const result = await sql.query\`${query}\`;
    return result.recordset;
  }
`
  } else {
    return `
module.exports.${name} = async ({
  ${fieldsList.map(f => `${f}`).join(', ')}
}) => {

  const result = await sql.query\`${query} WHERE
${fieldsList.map(f => `      ${f} = \${${f}}`).join(' AND\n')}
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