const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const createReadme = require('./create-readme');
const createTest = require('./create-http-test');
const createExpressServer = require('./esm-create-server');
const { create_spec, create_method_spec } = require('./esm-create-spec');
const create_db = require('./esm-create-db');
const create_model = require('./esm-create-model');

const ensure = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const create_get_delete = (name, method, path, params, authentication, validation ) => {
  const inputs = params.map(p => p.name).join(', ');
  const setCache = method === 'get' ? '    //res.setHeader("Cache-Control", "public, max-age=86400");' : '';
  return `app.${method}('${path}', ${authentication}${validation}
  async (req, res) => {
${inputs.length ? `    const {${inputs}} = req.params;
    const result = await ${name}['${method} ${path}'](${inputs});` : `
    const result = await ${name}['${method} ${path}']();`}
${setCache}
    res.json(result);
  }
);

`;
}

const create_post_put = (name, method, path, fields, authentication, validation) => {
  const inputs = fields.map(f => f.name).join(', ');

  if (fields.length) validation += `
  validate('body', {
${fields.map(p => `    "${p.name}": { type: "${p.type}", required: true}`).join(',\n')}
  }),`;

  return `app.${method}('${path}', ${authentication}${validation}
  async (req, res) => {
    const {${inputs}} = req.body;
    const result = await ${name}['${method} ${path}'](${inputs});
    res.json(result);
  }
);

`;
};


const create_api = (name, paths) => paths.map((pathDef) => {
  let { method, path, fields, authentication, params, queries } = pathDef;
  authentication = authentication ? 'auth, ' : '';
  let method_spec = create_method_spec(pathDef);
  method_spec = method_spec.split('\n')
    .filter(l => l.trim().length)
    .map(line => `*${line.substring(2)}`).join('\n');

  let validation = '';
  if (params.length) validation += `
  validate('params',{
${params.map(p => `    "${p.name}": { type: "${p.type}", required: true}`).join(',\n')}
  }),`;

  if (queries.length) validation += `
  validate('query',{
${queries.map(p => `    "${p.name}": { type: "${p.type}", required: true}`).join(',\n')}
  }),`;

  const method_func = (method === 'get' || method === 'delete') ?
    create_get_delete(name, method, path, params, authentication, validation) :
    create_post_put(name, method, path, fields, authentication, validation);
  return `/**
* @swagger
* ${path}
${method_spec}
*/
${method_func}
`
});


const create_routes = (model, config) => {

  const { api_path } = config;
  const { name, paths } = model;
  const api_file = `${api_path}/${name}.js`;
  const apis = create_api(name, paths).join('');

  const content = `//@ts-check
import express from 'express';
import ${name} from '../models/${name}.js';
import auth from '../auth.js';
import validate from '../validate.js';
const app = express.Router();

${apis}
export default app;
`;
  fs.writeFileSync(api_file, content);
};

module.exports = (cwd, config) => {

  config.api_path = path.resolve(cwd, 'api');
  config.model_path = path.resolve(cwd, 'models');

  ensure(cwd);
  ensure(config.api_path);
  ensure(config.model_path);

  config.models.forEach(model => {
    create_routes(model, config);
    create_model(model, config);
  });

  fs.copyFileSync(`${__dirname}/esm-auth.js`, `${cwd}/auth.js`);
  fs.copyFileSync(`${__dirname}/esm-validate.js`, `${cwd}/validate.js`);
  fs.writeFileSync(`${cwd}/server.js`, createExpressServer(config));
  fs.writeFileSync(`${cwd}/test.http`, createTest(config));
  fs.writeFileSync(`${cwd}/README.md`, createReadme(config));
  fs.writeFileSync(`${cwd}/api-spec.yaml`, create_spec(config));
  const db = create_db(cwd, config) || '';

  if (!fs.existsSync(`${cwd}/package.json`)) {
    execSync(`npm init -y`, { cwd });
    const json = require(`${cwd}/package.json`);
    json.type = 'module';
    if (!json.scripts) json.scripts = {};
    json.scripts.start = 'node server.js';
    json.scripts["build:client"] = "apprun-site build";
    json.scripts["build:server"] = "create-data-api-app";
    json.scripts["build:zip"] = "zip -r archive.zip public/ api/ server.js package*.json";
    fs.writeFileSync(`${cwd}/package.json`, JSON.stringify(json, null, 2));
  }

  execSync(`npm install apprun apprun-site dotenv jsonwebtoken zod`, { cwd });
  if (db === 'mssql') execSync(`npm install mssql`, { cwd });
  if (db === 'mysql' || db === 'mysql2') execSync(`npm install mysql2 sql-template-strings`, { cwd });
}