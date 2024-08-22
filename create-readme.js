//@ts-check
const create_api = database => database.paths.map(
  ({ path, method, field_names }) => {

    method = method.toUpperCase();

    if (method === 'GET' || method === 'DELETE') {
      return `###\n${method} ${path}`;
    } else {
      return `###\n${method} ${path}
Content-Type: application/json
{
${field_names.map(key => `  "${key}": ""`).join(',\n')}
}
`;
    }
  }).join('\n\n');


module.exports = ({ name, port, databases }) => {

  const apis = !databases || !databases.length ? '' :
    databases.map(d => create_api(d)).join('\n');

  return `
# ${name}

## Installation

\`\`\`bash
npm init -y
npm install express body-parser mssql
node server.js
\`\`\`

## Usage

[http://localhost:${port}](http://localhost:${port})

## API

[api-spec](api-spec.yaml)

`;
};


