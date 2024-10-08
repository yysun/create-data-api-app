//@ts-check
const init = `//@ts-check
const sql = require('./db');`;

const validator = {};

function createGet({ name, select, field_names, keys }) {
  const selectList = field_names.length === 0 ? '      *' :
    field_names.map(f => `      ${f}`).join(',\n');
  select = select || `SELECT\n${selectList}\n    FROM ${name}`;

  const where = !keys || keys.length === 0 ? '' :
    `WHERE
${keys.map(f => `      ${f.comment || f.name} = \${${f.name}}`).join(' AND\n')}`;

  return `
    const result = await sql.query\`${select} ${where}\`;
    return result;
`;
}

function createPost({ name, field_names }) {
  return `
    const result = await sql.query\`INSERT INTO ${name} (
${field_names.map(f => `      ${f}`).join(',\n')}
    ) VALUES (
${field_names.map(f => `      \${${f}}`).join(',\n')}
    )\`;
    return result;
`;

}

function createPut({ name, field_names, key_names }) {
  return `
    const result = await sql.query\`MERGE INTO ${name} WITH (HOLDLOCK) AS target
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

    return result;
`;

}

function createDelete({ name, key_names }) {
  return `
    const result = await sql.query\`DELETE FROM ${name} WHERE
${key_names.map(f => `      ${f} = \${${f}}`).join(' AND\n')}\`;
    return result;
`;
}

function createPatch({ name, field_names, key_names }) {
  return `
    const result = await sql.query\`UPDATE ${name} SET
${field_names.map(f => `      ${f} = \${${f}}`).join(',\n')}
    WHERE
${key_names.map(f => `      ${f} = \${${f}}`).join(' AND\n')}\`;
    return result;
`;
}

function createStoredProcedure({ name, fields }) {
  return `
  "${name}": async ({
    ${fields.map(f => `${f.name}`).join(', ')}
  }) => {
    const result = await sql.query\`${name}
      ${fields.map(f => `\${${f.name}}`).join(', ')}\`;
    return result;
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

const create_validation = (key, inputs) => {
  return inputs.split(',').map(f => {
    f = f.trim();
    if (!f) return '';
    if (!validator[key]) validator[key] = {};
    validator[key][f] = {};
    return `
    if (!validate('${key}', '${f}', ${f})) throw new Error('${f} is invalid');`
  }).join('');
}

const create_method = pathDef => {
  const { path, method } = pathDef;
  let inputs = pathDef.field_names.join(', ');
  if (method === 'get' || method === 'delete') {
    inputs = pathDef.key_names.join(', ');
  }
  const key = `${method} ${path}`;
  return `  "${key}": async (${inputs}) => {
    ${create_validation(key, inputs)}
    ${create_sql(pathDef)}
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
}
`;

module.exports = ({ databases }) => {

  if( !databases || !databases.length ) return '';
  const src = databases.map(module => create_model(module)).join('\n');

  return `${init}
${src}

const validator = ${JSON.stringify(validator, null, 2)};

function validate(func, name, f) {
  return validator[func][name](f);
}
`;

}