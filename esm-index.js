const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const createReadme = require('./create-readme');
const createTest = require('./create-http-test');
const createExpressServer = require('./esm-create-server');
const { create_spec, create_method_spec } = require('./esm-create-spec');
const create_model = require('./esm-create-model');

const ensure = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const relative = (file) => path.relative(process.cwd(), file);

const writeFile = (file, content) => {
  console.log(`Writing: ${relative(file)}`);
  fs.writeFileSync(file, content);
}

const writeFileIfNotExists = (file, content) => {
  if (!fs.existsSync(file)) writeFile(file, content);
  else console.log(`Warning: ${relative(file)} already exists, skipped`);
}

const copyFileSyncIfNotExists = (src, dest) => {
  if (!fs.existsSync(dest)) {
    console.log(`Copying: ${relative(src)} to ${relative(dest)}`);
    fs.copyFileSync(src, dest);
  }
  else console.log(`Warning: ${relative(dest)} already exists, skipped`);
}

const create_get_delete = (name, method, path, params, authentication, validation ) => {
  const inputs = params.map(p => p.name).join(', ');
  const setCache = method === 'get' ? '    //res.setHeader("Cache-Control", "public, max-age=86400");' : '';
  if (validation) validation = '\n' + validation + '\n';
  return `app.${method}('${path}', ${authentication}${validation}
  async (req, res, next) => {
    try {
${inputs.length ? `    const {${inputs}} = req.params;
    const result = await ${name}['${method} ${path}'](${inputs});` : `
    const result = await ${name}['${method} ${path}']();`}
${setCache}
    res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

`;
}

const create_validation = (type, fields) => {
  const create_field_validation = (field) => {
    let { name, type, validation } = field;
    let json = validation ? JSON.parse(validation) : {};
    if(type === 'varchar') type = 'string';
    json = { type, ...json };
    return `    "${name}": ${JSON.stringify(json)}`;
  }
  return `
  validate('${type}',{
${fields.map(f => create_field_validation(f)).join(',\n')}
  }),`;
};

const create_post_put = (name, method, path, fields, authentication, validation) => {
  const inputs = fields.map(f => f.name).join(', ');
  if (fields.length) validation += create_validation('body', fields);
  return `app.${method}('${path}', ${authentication}
  ${validation}

  async (req, res, next) => {
    const {${inputs}} = req.body;
    try {
      const result = await ${name}['${method} ${path}'](${inputs});
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

`;
};


const create_api = (name, paths) => paths.map((pathDef) => {
  let { method, path, fields, authentication, params, queries } = pathDef;
  authentication = authentication ? 'auth, ' : '';
  // let method_spec = create_method_spec(pathDef);
  // method_spec = method_spec.split('\n')
  //   .filter(l => l.trim().length)
  //   .map(line => `*${line.substring(2)}`).join('\n');

  let validation = '';
  if (params.length) validation += create_validation('params', params);
  if (queries.length) validation += create_validation('query', queries);

  const method_func = (method === 'get' || method === 'delete') ?
    create_get_delete(name, method, path, params, authentication, validation) :
    create_post_put(name, method, path, fields, authentication, validation);
  return `
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
import auth from '../middleware/auth.js';
import validate from './validate.js';
const app = express.Router();

${apis}
export default app;
`;
  writeFile(api_file, content);
};

const create_db = (cwd, config) => {
  const { database } = config;
  if (database === 'mysql2' || database === 'mysql') {
    copyFileSyncIfNotExists(`${__dirname}/esm-db-mysql.js`, `${cwd}/models/db.js`);
    writeFileIfNotExists(`${cwd}/.env`, `
MYSQL_SERVER=localhost
MYSQL_DATABASE=realworld
MYSQL_USER=root
MYSQL_PASSWORD=
  `);
  } else if (database === 'mssql') {
    copyFileSyncIfNotExists(`${__dirname}/esm-db-mssql.js`, `${cwd}/models/db.js`);
    writeFileIfNotExists(`${cwd}/.env`, `
SQL_CONNECTION_STRING=Server=localhost;Database=mydb;Trusted_Connection=True;
  `);
  } else {
    console.log(`Database ${database} not supported`);
  }
  return database;
}

module.exports = {

  create_validation,

  default: (cwd, config, no_npm_install) => {

    config.api_path = path.resolve(cwd, 'api');
    config.model_path = path.resolve(cwd, 'models');
    config.middleware_path = path.resolve(cwd, 'middleware');

    ensure(cwd);
    ensure(config.api_path);
    ensure(config.model_path);
    ensure(config.middleware_path);

    config.models.forEach(model => {
      create_routes(model, config);
      create_model(model, config);
    });

    copyFileSyncIfNotExists(`${__dirname}/esm-auth.js`, `${cwd}/middleware/auth.js`);
    copyFileSyncIfNotExists(`${__dirname}/esm-validate.js`, `${cwd}/api/validate.js`);
    writeFile(`${cwd}/api-spec.yaml`, create_spec(config));
    writeFile(`${cwd}/test.http`, createTest(config));
    writeFileIfNotExists(`${cwd}/server.js`, createExpressServer(config));
    writeFileIfNotExists(`${cwd}/README.md`, createReadme(config));
    copyFileSyncIfNotExists(`${__dirname}/dockerfile`, `${cwd}/dockerfile`);
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
      writeFile(`${cwd}/package.json`, JSON.stringify(json, null, 2));
    }

    if (!no_npm_install) {
      execSync(`npm install apprun apprun-site dotenv jsonwebtoken zod`, { cwd });
      if (db === 'mssql') execSync(`npm install mssql`, { cwd });
      if (db === 'mysql' || db === 'mysql2') execSync(`npm install mysql2 sql-template-strings`, { cwd });
    } else {
      console.log('Please run `npm install apprun apprun-site dotenv jsonwebtoken zod` to install the required packages');
    }
  }
}