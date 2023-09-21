module.exports = (name, port, entities) => {

  const createTest = require('./create-http-test');

  const entity_diagram = ({ name, fields }) => `${name} {\n` +
    fields.map(field => `  ${field.def}`).join('\n') +
    '\n}';

  const diagram = !entities || !entities.length ? '' :
    entities
      .filter(e => e.type === 'table')
      .map(e => entity_diagram(e)).join('\n\n');

  return `
# ${name}

## Installation

\`\`\`bash
npm init -y
npm install express mssql
\`\`\`

## API

## Data Model

\`\`\`mermaid
erDiagram
${diagram}
\`\`\`
`;
};


