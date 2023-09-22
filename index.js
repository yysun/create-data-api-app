const fs = require('fs');
const yaml = require('js-yaml');

const createReadme = require('./create-readme');
const createTest = require('./create-http-test');
const createModel = require('./create-model');
const createExpressApp = require('./create-express-app');
const createAzureApp = require('./create-azure-app');

const configParser = require('./config-parser');

module.exports = ({ conf, cwd }) => {


  const config = configParser(conf);

  fs.writeFileSync(`${cwd}/model.js`, createModel(config));
  fs.writeFileSync(`${cwd}/index.js`, createExpressApp(config));
  fs.writeFileSync(`${cwd}/app-azure.js`, createAzureApp(config));
  // fs.writeFileSync(`${cwd}/test.http`, createTest(config));
  // fs.writeFileSync(`${cwd}/README.md`, createReadme(config));

}