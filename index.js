const fs = require('fs');
// const path = require('path');
const yaml = require('js-yaml');
const { init, connect, close, createGet, createPost, createPut, createDelete, createPatch } = require('./mssql');

module.exports = ({ conf, cwd }) => {

  const configFile = fs.readFileSync(conf, 'utf8');
  const { name, port, base, api, public } = yaml.load(configFile);
  api.forEach(item => item.path = `${base}${item.path}`);

  const createDiagram = () => {
    return !api || !api.length ? '' :
      api.map(({ name, fields }) => `${name} {\n` + fields.map(field => `  ${field}\n`)
        .join('')).join('') + '}';
  };

  const createRestApiTest = () => {
    return !api || !api.length ? '' :
      api.map(({ path, methods }) => methods.split(',').map(method => {
        method = method.trim().toUpperCase();
        return `###\n${method} {{host}}${path}\n\n`;
      }).join('')).join('');
  };

  const createRestApiMethod = (method, api) => {
    method = method.trim().toLowerCase();
    switch (method) {
      case 'get':
        return createGet(api);
      case 'post':
        return createPost(api);
      case 'put':
        return createPut(api);
      case 'delete':
        return createDelete(api);
      case 'patch':
        return createPatch(api);
    }
  };

  const createRestApi = () => {
    return !api || !api.length ? '' :
      api.map(a => a.methods.split(',').map(method =>
        createRestApiMethod(method, a)).join('')).join('');
  };

  const sourceCode = `
require('dotenv').config()
const express = require('express');
const app = express();
${public && `app.use(express.static('${public}'));` || ''}

${init()}
${connect()}
${close()}

${createRestApi()}
const port = process.env.port || ${port || 3000};
app.listen(port, () => {
  console.log(\`API server listening on port \${port}\`);
});
`;

  const testCode = `
@host=http://localhost:${port}

${createRestApiTest()}
`;

  const readmeCode = `
# ${name}

## Installation

\`\`\`bash
npm init -y
npm install express mssql
\`\`\`

## API

${createRestApiTest()}

## Data Model

\`\`\`mermaid
erDiagram
${createDiagram()}
\`\`\`
`;

  fs.writeFileSync(`${cwd}/index.js`, sourceCode);
  fs.writeFileSync(`${cwd}/test.http`, testCode);
  fs.writeFileSync(`${cwd}/README.md`, readmeCode);

}