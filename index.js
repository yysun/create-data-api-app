const fs = require('fs');
const yaml = require('js-yaml');

const createDiagram = require('./create-diagram');
const createTest = require('./create-http-test');
const createModel = require('./create-model');
const createApi = require('./create-api');

module.exports = ({ conf, cwd }) => {

  const configFile = fs.readFileSync(conf, 'utf8');
  const { name, port, base, entities, public } = yaml.load(configFile);
  entities.forEach(entity => {
    entity.path_plural = `${base}${entity.path_plural || entity.path}`;
    entity.path = `${base}${entity.path}`;
    if (entity.type === 'query') {
      entity.methods = 'get';
    } else if (entity.type === 'stored procedure') {
      entity.methods = 'post';
    }
  });

  const readmeCode = `
# ${name}

## Installation

\`\`\`bash
npm init -y
npm install express mssql
\`\`\`

## API

${createTest(port, entities).replace(/\{\{host\}\}/g, '').replace(/###/g, '')}

## Data Model

\`\`\`mermaid
erDiagram
${createDiagram(entities)}
\`\`\`
`;

  fs.writeFileSync(`${cwd}/model.js`, createModel(entities));
  fs.writeFileSync(`${cwd}/server.js`, createApi(port, public, entities));
  fs.writeFileSync(`${cwd}/test.http`, createTest(port, entities));
  fs.writeFileSync(`${cwd}/README.md`, readmeCode);

}