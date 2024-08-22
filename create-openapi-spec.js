//@ts-check
const map_type = type => {
  switch (type) {
    case 'int':
      return 'integer';
    case 'date':
      return 'string';
    case 'datetime':
      return 'string';
    case 'time':
      return 'string';
    case 'timestamp':
      return 'string';
    case 'binary':
      return 'string';
    case 'json':
      return 'object';
    case 'array':
      return 'array';
    default:
      return 'string';
  }
}

const parameters = fields => fields.map(
  ({ name, type }) => `
        - name: ${name}
          in: query
          required: true
          schema:
            type: ${map_type(type)}
    `).join('');


const create_method = ({ method, name, func, fields, keys, authentication }) =>
  method === 'get' || method === 'delete' ? `
    ${method}:
      tags:
        - ${name}
      summary: ${func}
      ${keys.length ? `parameters:${parameters(keys)}` : ''}
      responses:
        '200':
          description: OK
` : `
    ${method}:
      tags:
        - ${name}
      summary: ${func}
      ${authentication ? `${security}` : ''}
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:${fields.map(({ name, type }) => `
                ${name}:
                  type: ${map_type(type)}`).join('')}
      responses:
        '200':
          description: OK
`;

const create_api = database => {

  const paths = {};
  database.paths.forEach(item => {
    const { path } = item;
    if (!paths[path]) {
      paths[path] = [item];
    } else {
      paths[path].push(item);
    }
  });

  return Object.keys(paths).map(path => `
  ${path}:
${paths[path].map(p => create_method(p)).join('')}
`).join('');

}

let security;

module.exports = ({ name, version, port, authentication, databases }) => {

  security = authentication ? `security:
        - ${authentication} : []` : '';

  const apis = !databases || !databases.length ? '' :
    databases.map(d => create_api(d)).join('');

  return `openapi: '3.0.0'
info:
  title: ${name}
  version: "${version}"
servers:
  - url: https://localhost:${port}

paths:${apis}
${authentication ? `
components:
  securitySchemes:
    jwtAuth:
      type: http
      scheme: bearer
    apiKeyAuth:
      type: apiKey
      in: header
      name: API-KEY
`: ''}
`;

}