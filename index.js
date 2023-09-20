const fs = require('fs');
// const path = require('path');
const yaml = require('js-yaml');

module.exports = ({ conf }) => {

  const configFile = fs.readFileSync(conf, 'utf8');
  const { port, base, apis, public } = yaml.load(configFile);

  const createTest = ({ name, path, method }) => {
    method = method.trim().toUpperCase();
    return `###\n${method} {{host}}${base}${path}\n\n`;
  };
  const createMethod = ({ name, path, method }) => {
    method = method.trim().toLowerCase();
    return `
app.${method}('${base}${path}', (req, res) => {
  res.send('');
});\n`

  };

  const createApi = ({ name, path, methods }, fn) => methods.split(',')
    .map(method => fn({ name, path, method })).join('');

  const sourceCode = `
const express = require('express');
const app = express();
${public && `app.use(express.static('${public}'));` || ''}
${apis && apis.map(api => `${createApi(api, createMethod)}`).join('')}

const port = process.env.port || ${port || 3000};
app.listen(port, () => {
  console.log(\`API server listening on port \${port}\`);
});



/* Tests

@host=http://localhost:${port}

${apis && apis.map(api => `${createApi(api, createTest)}`).join('')}
*/
`;

  console.log(sourceCode);
}