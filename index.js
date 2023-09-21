const fs = require('fs');
const yaml = require('js-yaml');

const createDiagram = require('./create-diagram');
const createTest = require('./create-http-test');
const createModel = require('./create-model');
const createExpressApp = require('./create-express-app');
const createAzureApp = require('./create-azure-app');

module.exports = ({ conf, cwd }) => {

  const configFile = fs.readFileSync(conf, 'utf8');
  const { name, port, path, entities, public } = yaml.load(configFile);
  entities.forEach(entity => {
    entity.path = `${path ?? ''}/${entity.name}`;
  });

  const readmeCode = `
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
${createDiagram(entities)}
\`\`\`
`;

  fs.writeFileSync(`${cwd}/model.js`, createModel(entities));
  fs.writeFileSync(`${cwd}/app-express.js`, createExpressApp(port, public, entities));
  fs.writeFileSync(`${cwd}/app-azure.js`, createAzureApp(entities));
  // fs.writeFileSync(`${cwd}/test.http`, createTest(port, entities));
  fs.writeFileSync(`${cwd}/README.md`, readmeCode);

}