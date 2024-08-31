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

const create_method = ({ method, name, func, fields, params, queries, authentication }) =>
  method === 'get' || method === 'delete' ? `    ${method}:
      tags:
        - ${name}
      summary: ${func}
      ${authentication ? `security: []` : ''}
      ${params.length ? `parameters:${parameters(params)}` : ''}
      ${queries.length ? `parameters:${parameters(queries)}` : ''}
      responses:
        '200':
          description: OK
          ${method==='get' ? `content:
            application/json:
            schema:
              type: object
              properties:${fields.map(({ name, type }) => `
                ${name}:
                  type: ${map_type(type)}`).join('')}` : ''}

` : `    ${method}:
      tags:
        - ${name}
      summary: ${func}
      security: ${authentication ? `[]` : ''}
      ${params.length ? `parameters:${parameters(params)}` : ''}
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

const create_module = database => {

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


const create_spec = ({ name, version, port, authentication, databases }) => {

  security = authentication ? `security:
        - ${authentication} : []` : '';

  const apis = !databases || !databases.length ? '' :
    databases.map(d => create_module(d)).join('');

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

module.exports = {
  create_spec,
  create_method_spec: create_method
}