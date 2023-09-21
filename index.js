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
    const fields = entity.fields || [];
    entity.fields = fields.map(f => {
      const [type, name, keys, comment] = f.split(' ');
      const pk = keys?.indexOf('PK') > -1;
      return { type, name, pk, comment, def: f };
    });
    entity.keys = entity.fields.filter(f => f.pk)
      .map(f => f.name) || [];
  });

  fs.writeFileSync(`${cwd}/model.js`, createModel(entities));
  fs.writeFileSync(`${cwd}/index.js`, createExpressApp(port, public, entities));
  fs.writeFileSync(`${cwd}/app-azure.js`, createAzureApp(entities));
  fs.writeFileSync(`${cwd}/test.http`, createTest(port, entities));
  fs.writeFileSync(`${cwd}/README.md`, createReadme(name, port, entities));

}