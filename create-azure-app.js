const create_api = database => database.paths.map(
  ({ path, method, func, key_names }) => {

    return (method === 'get' || method === 'delete') > 0 ? `
app.http('${path}', {
  methods: ['${method}'],
  handler: async (request) => {
${key_names.map(key => `  const ${key} = request.params.${key};`).join('\n')}
  const result = await model.${database.name}['${func}'](${key_names.join(', ')});
    return { jsonBody: result };
  }
});
` : `
app.http('${path}', {
  methods: ['${method}'],
  handler: async (request) => {
    const body = request.body;
    const result = await model.${database.name}['${func}'](body);
    return { jsonBody: result };
  }
});
`; }).join('');


module.exports = ({ port, public, path, databases }) => {

  const apis = !databases || !databases.length ? '' :
    databases.map(d => create_api(d)).join('\n');

  return `const model = require('./model');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());
${public && `app.use(express.static('${public}'));` || ''}

${apis}

const port = process.env.port || ${port || 3000};
app.listen(port, () => {
  console.log(\`API server listening on port \${port}\`);
});
`;

}