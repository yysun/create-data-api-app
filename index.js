const fs = require('fs');

const createReadme = require('./create-readme');
const createTest = require('./create-http-test');
const createModel = require('./create-model');
const createExpressApp = require('./create-express-app');
const createExpressServer = require('./create-express-server');
const createAzureApp = require('./create-azure-app');
const createOpenAPISpec = require('./create-openapi-spec');

const configParser = require('./config-parser');

module.exports = ({ conf, cwd }) => {

  const config = configParser(conf);

  fs.writeFileSync(`${cwd}/model.js`, createModel(config));
  fs.writeFileSync(`${cwd}/app-express.js`, createExpressApp(config));
  fs.writeFileSync(`${cwd}/server.js`, createExpressServer(config));
  // fs.writeFileSync(`${cwd}/app-azure.js`, createAzureApp(config));
  fs.writeFileSync(`${cwd}/test.http`, createTest(config));
  fs.writeFileSync(`${cwd}/README.md`, createReadme(config));
  fs.writeFileSync(`${cwd}/api-spec.yaml`, createOpenAPISpec(config));

}