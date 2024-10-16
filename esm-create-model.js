//@ts-check
const fs = require('fs');


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
  // procedure: ${name}
  ${name}: async (${fields.map(f => `${f.name}`).join(', ')}) =>{
    ${fields.length === 0 ? `
    const result = await sql.query\`${name}\`` : `
    const result = await sql.query\`${name}
      ${fields.map(f => `\${${f.name}}`).join(', ')}\`;`}
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


const create_method = pathDef => {
  const { type, name, func, method } = pathDef;
  let inputs = pathDef.fields.map(f => f.name).join(', ');
  if (method === 'get' || method === 'delete') {
    inputs = pathDef.params.map(p => p.name).join(', ');
  }

  return `  // ${type}: ${name}
  ${func} : async (${inputs}) =>{
    ${create_sql(pathDef)}
  },
  `
};

module.exports = (model, config) => {

  const { model_path } = config;
  const { name, paths } = model;
  const model_file = `${model_path}/${name}.js`;

  paths.forEach(path => {
    if (path.type === 'query') {
      path.select = model.objects.find(o => o.query === path.name).select;
    }
  });

  const services = paths.map((path) => {
    if (path.type === 'procedure') {
      return createStoredProcedure(path);
    } else {
      return create_method(path);
    }
  }).join('\n');


  const content = `//@ts-check
import sql from './db.js';
export default {
  ${services}
}
`;
  fs.writeFileSync(model_file, content);
}
