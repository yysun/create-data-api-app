const create_api = database => database.paths.map(
  ({ path, method, func, key_names, authentication }) => {
    authentication = authentication ? 'auth, ' : '';
    return (method === 'get' || method === 'delete') > 0 ? `
  app.${method}('${path}', ${authentication}async (req, res) => {
${key_names.map(key => `    const ${key} = req.params.${key};`).join('\n')}
    const result = await model.${database.name}['${func}'](${key_names.join(', ')});
    ${method === 'get' ? '//res.setHeader("Cache-Control", "public, max-age=86400");' : ''}
    res.json(result);
  });
`: `
  app.${method}('${path}', ${authentication}async (req, res) => {
    const body = req.body;
    const result = await model.${database.name}['${func}'](body);
    res.json(result);
  });
`}).join('');


module.exports = ({ authentication, databases }) => {

  const apis = !databases || !databases.length ? '' :
    databases.map(d => create_api(d)).join('\n');

  return `const model = require('./model');
module.exports = app => {
${authentication ? `
  const auth = app.authentication;
  console.assert(!!auth, 'app.authentication is not defined');` : ''}
${apis}
};`;

}