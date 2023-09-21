module.exports = (port, entities) => {

  const entity_test = ({ name, type, path, methods }) => {

    if (type === 'stored procedure' || type === 'query') {
      return `## ${name}\n###\nPOST {{host}}${path}
Content-Type: application/json\n`;
    }

    return !methods ? '' : `## [${name}]\n` +
      methods.split(',').map(method => {
        method = method.trim().toUpperCase();
        return `###\n${method} {{host}}${path}
Content-Type: application/json\n`;
      }).join('\n');

  }

  const tests = !entities || !entities.length ? '' :
    entities.map(e => entity_test(e)).join('\n');

  return `
@host=http://localhost:${port}

${tests}
`;
}