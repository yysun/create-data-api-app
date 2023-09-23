const create_api = database => database.paths.map(
  ({ path, method, func, key_names }) => {

    return (method === 'get' || method === 'delete') > 0 ? `
  app.${method}('${path}', async (req, res) => {
${key_names.map(key => `    const ${key} = req.params.${key};`).join('\n')}
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


module.exports = ({ databases }) => {

  const apis = !databases || !databases.length ? '' :
    databases.map(d => create_api(d)).join('\n');

  return `const model = require('./model');
module.exports = app => {
${apis}
};`;

}