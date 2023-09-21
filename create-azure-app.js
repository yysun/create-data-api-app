module.exports = (entities) => {

  const api_method = (method, { name, type, path, id, fields }) => {
    method = method.trim().toLowerCase();
    fields = fields.map(f => {
      const [type, name, keys, comment] = f.split(' ');
      const pk = keys?.indexOf('PK') > -1;
      return { type, name, pk, comment };
    });

    const pk = fields.find(f => f.pk)?.name;
    id = id || pk;

    if (type === 'stored procedure') {

      return `
app.http('${path}', {
  methods: ['${method}'],
  handler: async (request) => {
    const body = request.body;
    const result = await model.${name}(body);
    return { jsonBody: result };
  }
});
`
    } else {
      switch (method) {
        case 'get':
          return `
app.http('${path}/:${id}', {
  methods: ['GET'],
  handler: async (request) => {
    const ${id} = request.params.${id};
    const result = await model.${name}.getOne(${id});
    return { jsonBody: result };
  }
});

app.http('${path}', {
  methods: ['GET'],
  handler: async (request) => {
    const result = await model.${name}.getAll();
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
  }

  const entity_api = e => `// -- ${e.name} --
  ${e.methods.split(',').map(method => api_method(method, e)).join('')}
`;

  const api = !entities || !entities.length ? '' :
    entities.map(e => entity_api(e)).join('');

  const sourceCode = `const model = require('./model');
const { app } = require('@azure/functions');

${api.trim()}
`;

  return sourceCode;

}