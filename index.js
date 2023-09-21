const fs = require('fs');
const yaml = require('js-yaml');

const createReadme = require('./create-readme');
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

  fs.writeFileSync(`${cwd}/model.js`, createModel(entities));
  fs.writeFileSync(`${cwd}/app-express.js`, createExpressApp(port, public, entities));
  fs.writeFileSync(`${cwd}/app-azure.js`, createAzureApp(entities));
  fs.writeFileSync(`${cwd}/test.http`, createTest(port, entities));
  fs.writeFileSync(`${cwd}/README.md`, createReadme(name, port, entities));

}