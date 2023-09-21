const fs = require('fs');
const yaml = require('js-yaml');

const createDiagram = require('./create-diagram');
const createTest = require('./create-http-test');
const createModel = require('./create-model');
const createApi = require('./create-api');

module.exports = ({ conf, cwd }) => {

  const configFile = fs.readFileSync(conf, 'utf8');
  const { name, port, base, entities, public } = yaml.load(configFile);
  entities.forEach(item => item.path = `${base}${item.path}`);

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
  fs.writeFileSync(`${cwd}/index.js`, createApi(port, public, entities));
  fs.writeFileSync(`${cwd}/test.http`, createTest(port, entities));
  fs.writeFileSync(`${cwd}/README.md`, readmeCode);

}