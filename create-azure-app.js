module.exports = (entities) => {

  const api_method = (method, { name, path, keys }) => {
    method = method.trim().toLowerCase();
    const pk = keys && keys[0];

    switch (method) {
      case 'get':
        return keys.length === 1 ?`
app.http('${path}/:${pk}', {
  methods: ['get'],
  handler: async (request) => {
    const ${pk} = request.params.${pk};
    const result = await model.${name}.find(${pk});
    return { jsonBody: result };
  }
});
` : `
app.http('${path}', {
  methods: ['post'],
  handler: async (request) => {
    const body = request.body;
    const result = await model.${name}.search(body);
    return { jsonBody: result };
  }
});

`;
      default:
        return `
app.http('${path}', {
  methods: ['${method}'],
  handler: async (request) => {
    const body = request.body;
    const result = await model.${name}.${method}(body);
    return { jsonBody: result };
  }
});
`
    } // switch
  }


  const entity_api = e => {
    if (e.type === 'stored procedure'|| e.type === 'query') {
      const { name, path } = e;
      return `
app.http('${path}', {
  methods: ['post'],
  handler: async (request) => {
    const body = request.body;
    const result = await model.${name}(body);
    return { jsonBody: result };
  }
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
const { app } = require('@azure/functions');

${api.trim()}
`;

  return sourceCode;

}