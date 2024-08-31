const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const createReadme = require('./create-readme');
const createTest = require('./create-http-test');
const createExpressServer = require('./esm-create-server');
const createOpenAPISpec = require('./create-openapi-spec');
const create_db = require('./esm-create-db');
const create_model = require('./esm-create-model');
const { create } = require('domain');

const ensure = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const create_get_delete = (name, method, path, key_names, authentication) => {
  let text = `
app.${method}('${path}', ${authentication}async (req, res) => {\n`;
  if (key_names.length) {
    text += `  const querySchema = z.object({
${key_names.map(key => `    ${key}: z.string().min(1, '${key} is required'),`).join('\n')}
  });
  const parsedQuery = querySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ errors: parsedQuery.error.errors });
  }
  const query = parsedQuery.data;
  const result = await ${name}['${method} ${path}'](query);\n`
  } else {
    if (method === 'delete') text += `// Delete evertyhing - ${path}?\n`;
    text += `  const result = await ${name}['${method} ${path}']({});\n`;
  }
  text += `  ${method === 'get' ? '//res.setHeader("Cache-Control", "public, max-age=86400");' : ''}
  res.json(result);
});

`;
  return text;
}

const create_post_put = (name, method, path, field_names, authentication) => `
app.${method}('${path}', ${authentication}async (req, res) => {
  const bodySchema = z.object({
${field_names.map(key => `    ${key}: z.string().min(1, '${key} is required'),`).join('\n')}
  });
  const parsedBody = bodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ errors: parsedBody.error.errors });
  }
  const body = parsedBody.data;
  const result = await ${name}['${method} ${path}'](body);
  res.json(result);
});

`


const create_api = (name, paths) => paths.map((pathDef) => {
  let { method, path, key_names, field_names, authentication } = pathDef;
  authentication = authentication ? 'auth, ' : '';
  return (method === 'get' || method === 'delete') ?
    create_get_delete(name, method, path, key_names, authentication) :
    create_post_put(name, method, path, field_names, authentication);
});


const create_routes = (model, config) => {

  const { api_path } = config;
  const { name, paths } = model;
  const api_file = `${api_path}/${name}.js`;
  const apis = create_api(name, paths).join('');

  const content = `//@ts-check
import express from 'express';
import {z} from 'zod';
import ${name} from '../models/${name}.js';
import auth from '../auth.js';
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
  fs.writeFileSync(`${cwd}/server.js`, createExpressServer(config));
  fs.writeFileSync(`${cwd}/test.http`, createTest(config));
  fs.writeFileSync(`${cwd}/README.md`, createReadme(config));
  fs.writeFileSync(`${cwd}/api-spec.yaml`, createOpenAPISpec(config));
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