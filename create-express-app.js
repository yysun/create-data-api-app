module.exports = (port, public, entities) => {

  const api_method = (method, { name, path, keys }) => {
    method = method.trim().toLowerCase();
    const pk = keys && keys[0];

    switch (method) {
      case 'get':
        return keys.length === 1 ? `
app.get('${path}/:${pk}', async (req, res) => {
  const ${pk} = req.params.${pk};
  const result = await model.${name}.find(${pk});
  res.json(result);
});
` : `
app.post('${path}', async (req, res) => {
  const body = req.body;
  const result = await model.${name}.search(body);
  res.json(result);
});
`;
      default:
        return `
app.${method}('${path}', async (req, res) => {
  const body = req.body;
  const result = await model.${name}.${method}(body);
  res.json(result);
});
`
    }
  }

  const entity_api = e => {
    if (e.type === 'stored procedure' || e.type === 'query') {
      const { name, path } = e;
      return `
app.post('${path}', async (req, res) => {
  const body = req.body;
  const result = await model.${name}(body);
  res.json(result);
});
`;
    } else {
      const methods = e.methods.split(',');
      return ` // -- ${e.name} --
${methods.map(method => api_method(method, e)).join('')}`;
    }
  };

  const api = !entities || !entities.length ? '' :
    entities.map(e => entity_api(e)).join('');

  const sourceCode = `const model = require('./model');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());
${public && `app.use(express.static('${public}'));` || ''}

${api.trim()}

const port = process.env.port || ${port || 3000};
app.listen(port, () => {
  console.log(\`API server listening on port \${port}\`);
});
`;

  return sourceCode;

}