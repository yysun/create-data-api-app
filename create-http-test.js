module.exports = (port, entities) => {

  const entity_test = ({ name, path, methods }) => `## - ${name}\n` +
    methods.split(',').map(method => {
    method = method.trim().toUpperCase();
    return `###\n${method} {{host}}${path}\n`;
  }).join('\n');

  const tests = !entities || !entities.length ? '' :
    entities.map(e => entity_test(e)).join('\n');

  return `
@host=http://localhost:${port}

${tests}
`;
}