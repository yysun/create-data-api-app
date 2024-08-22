//@ts-check
const create_api = database => database.paths.map(
  ({ path, method, field_names }) => {

    method = method.toUpperCase();

    if (method === 'GET' || method === 'DELETE') {
      return `###\n${method} {{host}}${path}`;
    } else {
      return `###\n${method} {{host}}${path}
Content-Type: application/json

{
${field_names.map(key => `  "${key}": ""`).join(',\n')}
}
`;
    }
  }).join('\n\n');


module.exports = ({ port, databases }) => {

  const apis = !databases || !databases.length ? '' :
    databases.map(d => create_api(d)).join('\n');

  return `@host=http://localhost:${port}

${apis}
`;

}