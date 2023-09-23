const create_api = database => database.paths.map(
  ({ path, method, func, key_names }) => {

    return (method === 'get' || method === 'delete') > 0 ? `
app.${method}('${path}', async (req, res) => {
${key_names.map(key => `  const ${key} = req.params.${key};`).join('\n')}
  const result = await model.${database.name}['${func}'](${key_names.join(', ')});
  res.json(result);
});
`: `
app.${method}('${path}', async (req, res) => {
  const body = req.body;
  const result = await model.${database.name}['${func}'](body);
  res.json(result);
});
`}).join('');


module.exports = ({ port, public, databases }) => {

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