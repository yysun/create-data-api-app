module.exports = entities => {

  const entity_diagram = ({ name, fields }) => `${name} {\n` +
    fields.map(field => `  ${field.replace('.', '_')}`).join('\n') +
    '\n}';

  const diagram = !entities || !entities.length ? '' :
    entities
      .filter(e => e.type === 'table')
      .map(e => entity_diagram(e)).join('\n\n');

  return diagram;
};


