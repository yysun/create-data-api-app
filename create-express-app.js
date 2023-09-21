module.exports = (port, public, entities) => {

  const api_method = (method, { name, path, id, fields }) => {
    method = method.trim().toLowerCase();
    fields = fields.map(f => {
      const [type, name, keys, comment] = f.split(' ');
      const pk = keys?.indexOf('PK') > -1;
      return { type, name, pk, comment };
    });

    const pk = fields.find(f => f.pk)?.name;
    id = id || pk;

    switch (method) {
      case 'get':
        return `
app.get('${path}/:${id}', async (req, res) => {
  const ${id} = req.params.${id};
  const result = await model.${name}.getOne(${id});
  res.json(result);
});

app.get('${path}', async (req, res) => {
  const result = await model.${name}.getAll();
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

  const entity_api = e => `// -- ${e.name} --
  ${e.methods.split(',').map(method => api_method(method, e)).join('')}
`;

  const api = !entities || !entities.length ? '' :
    entities.map(e => entity_api(e)).join('');

  const sourceCode = `const model = require('./model');
const express = require('express');
const app = express();
${public && `app.use(express.static('${public}'));` || ''}

${api.trim()}

const port = process.env.port || ${port || 3000};
app.listen(port, () => {
  console.log(\`API server listening on port \${port}\`);
});
`;

  return sourceCode;

}