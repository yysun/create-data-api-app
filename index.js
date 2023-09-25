const fs = require('fs');
const execSync = require('child_process').execSync;

const createReadme = require('./create-readme');
const createTest = require('./create-http-test');
const createModel = require('./create-model');
const createExpressApp = require('./create-express-app');
const createExpressServer = require('./create-express-server');
const createAzureApp = require('./create-azure-app');
const createOpenAPISpec = require('./create-openapi-spec');


module.exports = ({ conf, cwd, info }) => {

  const configParser = require('./config-parser');
  const config = configParser(conf);
  info && console.log(JSON.stringify(config, null, 2));
  
  fs.writeFileSync(`${cwd}/model.js`, createModel(config));
  fs.writeFileSync(`${cwd}/app-express.js`, createExpressApp(config));
  fs.writeFileSync(`${cwd}/server.js`, createExpressServer(config));
  // fs.writeFileSync(`${cwd}/app-azure.js`, createAzureApp(config));
  fs.writeFileSync(`${cwd}/test.http`, createTest(config));
  fs.writeFileSync(`${cwd}/README.md`, createReadme(config));
  fs.writeFileSync(`${cwd}/api-spec.yaml`, createOpenAPISpec(config));
  fs.writeFileSync(`${cwd}/.env`, `
SQL_CONNECTION_STRING=Server=localhost;Database=mydb;Trusted_Connection=True;
  `);

  if (!fs.existsSync(`${cwd}/package.json`)) {
    execSync(`npm init -y`, { cwd });
  }
  execSync(`npm install --save express body-parser dotenv jsonwebtoken mssql`, { cwd });
}